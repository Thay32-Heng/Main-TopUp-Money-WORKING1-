import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { dispatchProvisionJob } from '@/lib/queue';
import { SiteStatus, ProvisionStatus, LogLevel, OrderStatus } from '@prisma/client';

const retrySchema = z.object({
  orderId: z.string().optional(),
  siteId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, siteId } = retrySchema.parse(body);

    if (!orderId && !siteId) {
      return NextResponse.json({ error: 'Either orderId or siteId is required' }, { status: 400 });
    }

    const site = await prisma.site.findFirst({
      where: {
        OR: [{ id: siteId || undefined }, { orderId: orderId || undefined }],
      },
      include: {
        customer: true,
        order: true,
        version: true,
      },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Create new retry job in transaction
    const { updatedSite, provisionJob } = await prisma.$transaction(async (tx) => {
      if (site.order && site.order.status !== OrderStatus.PAID) {
        await tx.order.update({
          where: { id: site.order.id },
          data: { status: OrderStatus.PAID },
        });
      }

      const updatedSite = await tx.site.update({
        where: { id: site.id },
        data: {
          status: SiteStatus.PROVISIONING,
        },
      });

      const provisionJob = await tx.provisionJob.create({
        data: {
          siteId: site.id,
          orderId: site.order?.id,
          status: ProvisionStatus.QUEUED,
          currentStep: 'STEP_VALIDATE',
          retryCount: 1,
          logs: {
            create: {
              level: LogLevel.INFO,
              step: 'RETRY_INITIATED',
              message: 'Manual retry initiated from Control Plane Dashboard.',
            },
          },
        },
      });

      return { updatedSite, provisionJob };
    });

    // Enqueue
    await dispatchProvisionJob({
      jobId: provisionJob.id,
      siteId: updatedSite.id,
      orderId: site.order?.id || null,
      slug: updatedSite.slug,
      name: updatedSite.name,
      adminEmail: site.customer.email,
      dockerImageTag: site.version?.dockerImageTag || 'topup-template:1.0.0',
    });

    return NextResponse.json({
      success: true,
      message: 'Provisioning retry enqueued successfully',
      jobId: provisionJob.id,
      siteId: updatedSite.id,
    });
  } catch (err: any) {
    console.error('[POST /api/provision/retry] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to retry provisioning' }, { status: 500 });
  }
}
