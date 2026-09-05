import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { dispatchProvisionJob } from '@/lib/queue';
import { OrderStatus, SiteStatus, ProvisionStatus, LogLevel } from '@prisma/client';

const checkoutSchema = z.object({
  siteName: z.string().min(2, 'Site name must be at least 2 characters').max(100),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and single hyphens'),
  adminEmail: z.string().email('Invalid administrator email address'),
  customerName: z.string().optional(),
  productId: z.string().optional(),
  adminInitialPassword: z.string().min(8).optional(),
  topupApiKey: z.string().optional(),
  topupApiSecret: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = checkoutSchema.parse(body);

    const slug = validated.slug.toLowerCase().trim();

    // 1. Ensure slug uniqueness
    const existingSite = await prisma.site.findUnique({
      where: { slug },
    });

    if (existingSite) {
      return NextResponse.json(
        { error: `The store address / slug "${slug}" is already taken. Please choose another.` },
        { status: 409 }
      );
    }

    // 2. Resolve Product and ProductVersion
    let product = validated.productId
      ? await prisma.product.findUnique({
          where: { id: validated.productId },
          include: { versions: true },
        })
      : await prisma.product.findFirst({
          where: { active: true },
          include: { versions: true },
        });

    if (!product) {
      // Auto-seed default product if database is fresh
      product = await prisma.product.create({
        data: {
          name: 'Top-Up Game Store Template',
          slug: 'topup-store',
          price: 0.0,
          active: true,
          versions: {
            create: {
              version: '1.0.0',
              dockerImageTag: 'topup-template:1.0.0',
              isDefault: true,
            },
          },
        },
        include: { versions: true },
      });
    }

    const defaultVersion =
      product.versions.find((v) => v.isDefault) || product.versions[0];

    // 3. Upsert Customer
    const customer = await prisma.customer.upsert({
      where: { email: validated.adminEmail.toLowerCase().trim() },
      update: {
        name: validated.customerName || undefined,
      },
      create: {
        email: validated.adminEmail.toLowerCase().trim(),
        name: validated.customerName || validated.siteName,
        status: 'ACTIVE',
      },
    });

    const databaseName = `tenant_${slug.replace(/[^a-z0-9]/g, '_')}`;
    const rootDomain = process.env.ROOT_DOMAIN || 'topupdomain.com';

    // 4. Create Order, Site, and Primary Domain in a Transaction
    const shouldAutoProvision = Number(product.price) === 0 || process.env.AUTO_PROVISION_CHECKOUT !== 'false';

    const result = await prisma.$transaction(async (tx) => {
      // Create initial order
      const order = await tx.order.create({
        data: {
          customerId: customer.id,
          productId: product.id,
          versionId: defaultVersion?.id,
          total: product.price,
          currency: 'USD',
          status: shouldAutoProvision ? OrderStatus.PAID : OrderStatus.AWAITING_PAYMENT,
          paymentIntentId: shouldAutoProvision ? `auto_checkout_${Date.now()}` : null,
        },
      });

      // Create site linked to order
      const site = await tx.site.create({
        data: {
          customerId: customer.id,
          productId: product.id,
          versionId: defaultVersion?.id,
          orderId: order.id,
          name: validated.siteName,
          slug,
          status: shouldAutoProvision ? SiteStatus.PROVISIONING : SiteStatus.PENDING,
          databaseName,
          domains: {
            create: {
              hostname: `${slug}.${rootDomain}`,
              isPrimary: true,
              sslStatus: 'PENDING',
              verified: false,
            },
          },
        },
        include: {
          domains: true,
        },
      });

      let provisionJob = null;
      if (shouldAutoProvision) {
        provisionJob = await tx.provisionJob.create({
          data: {
            siteId: site.id,
            orderId: order.id,
            status: ProvisionStatus.QUEUED,
            currentStep: 'STEP_VALIDATE',
            retryCount: 0,
            logs: {
              create: {
                level: LogLevel.INFO,
                step: 'CHECKOUT_CONFIRMED',
                message: `Order ${order.id} confirmed. Auto-provisioning job registered.`,
              },
            },
          },
        });
      }

      return { order, site, provisionJob };
    });

    if (shouldAutoProvision && result.provisionJob) {
      await dispatchProvisionJob({
        jobId: result.provisionJob.id,
        siteId: result.site.id,
        orderId: result.order.id,
        slug: result.site.slug,
        name: result.site.name,
        adminEmail: customer.email,
        adminInitialPassword: validated.adminInitialPassword,
        dockerImageTag: defaultVersion?.dockerImageTag || process.env.DEFAULT_TENANT_IMAGE || 'topup-template:1.0.0',
        topupApiKey: validated.topupApiKey || '',
        topupApiSecret: validated.topupApiSecret || '',
      });
    }

    return NextResponse.json(
      {
        success: true,
        order: {
          id: result.order.id,
          total: result.order.total,
          currency: result.order.currency,
          status: result.order.status,
          createdAt: result.order.createdAt,
        },
        site: {
          id: result.site.id,
          name: result.site.name,
          slug: result.site.slug,
          status: result.site.status,
          primaryDomain: result.site.domains[0]?.hostname,
        },
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
        },
        payment: {
          checkoutUrl: `/checkout/${result.order.id}`,
          webhookEndpoint: '/api/webhooks/payment',
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: err.errors },
        { status: 400 }
      );
    }
    console.error('[POST /api/checkout] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
