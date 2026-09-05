import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { dispatchProvisionJob } from '@/lib/queue';
import { OrderStatus, SiteStatus, ProvisionStatus, LogLevel } from '@prisma/client';
import crypto from 'crypto';

const webhookPayloadSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  paymentIntentId: z.string().optional(),
  amount: z.union([z.number(), z.string()]).optional(),
  currency: z.string().optional(),
  status: z.string().optional(),
  topupApiKey: z.string().optional(),
  topupApiSecret: z.string().optional(),
});

/**
 * Signature verification helper
 */
function verifySignature(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) {
    // If webhook secret is not configured in dev, allow requests
    return true;
  }

  const signature = req.headers.get('x-webhook-signature') || req.headers.get('stripe-signature');
  if (!signature) {
    return false;
  }

  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(rawBody).digest('hex');
  const sigBuf = Buffer.from(signature);
  const digestBuf = Buffer.from(digest);

  if (sigBuf.length !== digestBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuf, digestBuf);
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    if (!verifySignature(req, rawBody)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    let parsedBody: any;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const validated = webhookPayloadSchema.parse(parsedBody);
    const { orderId, paymentIntentId } = validated;

    // 1. Fetch Order and related Site & Customer
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        site: true,
        customer: true,
        version: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: `Order "${orderId}" not found` }, { status: 404 });
    }

    // 2. Idempotency Check: If order is already paid, acknowledge without re-queueing
    if (order.status === OrderStatus.PAID) {
      return NextResponse.json({
        success: true,
        message: 'Order is already marked as PAID (idempotent)',
        orderId: order.id,
        siteId: order.site?.id,
      });
    }

    // 3. Atomically update Order, Site, and create ProvisionJob in a transaction
    const { updatedOrder, updatedSite, provisionJob } = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PAID,
          paymentIntentId: paymentIntentId || order.paymentIntentId || `pay_${crypto.randomUUID().slice(0, 8)}`,
        },
      });

      let updatedSite = null;
      let provisionJob = null;

      if (order.site) {
        updatedSite = await tx.site.update({
          where: { id: order.site.id },
          data: {
            status: SiteStatus.PROVISIONING,
          },
        });

        provisionJob = await tx.provisionJob.create({
          data: {
            siteId: order.site.id,
            orderId: order.id,
            status: ProvisionStatus.QUEUED,
            currentStep: 'PAYMENT_CONFIRMED',
            retryCount: 0,
            logs: {
              create: {
                level: LogLevel.INFO,
                step: 'PAYMENT_VERIFIED',
                message: `Payment confirmed for order ${order.id}. Auto-provisioning job registered.`,
              },
            },
          },
        });
      }

      return { updatedOrder, updatedSite, provisionJob };
    });

    // 4. Dispatch Job to BullMQ Provisioning Queue
    if (updatedSite && provisionJob) {
      await dispatchProvisionJob({
        jobId: provisionJob.id,
        siteId: updatedSite.id,
        orderId: updatedOrder.id,
        slug: updatedSite.slug,
        name: updatedSite.name,
        adminEmail: order.customer.email,
        dockerImageTag: order.version?.dockerImageTag || process.env.DEFAULT_TENANT_IMAGE || 'topup-template:1.0.0',
        topupApiKey: validated.topupApiKey || '',
        topupApiSecret: validated.topupApiSecret || '',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed and provisioning job enqueued',
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
      },
      site: updatedSite
        ? {
            id: updatedSite.id,
            slug: updatedSite.slug,
            status: updatedSite.status,
          }
        : null,
      provisionJobId: provisionJob?.id || null,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid webhook payload', details: err.errors }, { status: 400 });
    }
    console.error('[POST /api/webhooks/payment] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
