import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 1. Query order by ID
    let order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        product: true,
        version: true,
        site: {
          include: {
            domains: true,
            provisionJobs: {
              orderBy: { createdAt: 'desc' },
              take: 5,
              include: {
                logs: {
                  orderBy: { createdAt: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    // 2. If not found by orderId, attempt siteId fallback
    if (!order) {
      const site = await prisma.site.findFirst({
        where: { OR: [{ id }, { slug: id.toLowerCase() }] },
        include: {
          order: {
            include: {
              customer: true,
              product: true,
              version: true,
            },
          },
          domains: true,
          provisionJobs: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
              logs: {
                orderBy: { createdAt: 'asc' },
              },
            },
          },
        },
      });

      if (site && site.order) {
        order = {
          ...site.order,
          site: {
            ...site,
            domains: site.domains,
            provisionJobs: site.provisionJobs,
          },
        } as any;
      }
    }

    if (!order) {
      return NextResponse.json({ error: `Order or Site "${id}" not found` }, { status: 404 });
    }

    const site = order.site;
    const latestJob = site?.provisionJobs?.[0] || null;

    // Parse one-time credentials from finalization log if ready
    let adminCredentials: { email: string; password?: string } | null = null;
    if (site?.status === 'READY' && latestJob?.logs) {
      const finalLog = latestJob.logs.find((l) => l.step === 'STEP_FINALIZE');
      if (finalLog) {
        const passMatch = finalLog.message.match(/Password:\s*([^\s]+)/);
        const emailMatch = finalLog.message.match(/Admin:\s*([^\s]+)/);
        if (passMatch || emailMatch) {
          adminCredentials = {
            email: emailMatch ? emailMatch[1] : order.customer.email,
            password: passMatch ? passMatch[1] : undefined,
          };
        }
      }
    }

    const primaryDomain = site?.domains?.find((d) => d.isPrimary) || site?.domains?.[0];
    const baseUrl = process.env.PUBLIC_GATEWAY_URL || 'http://localhost';
    const publicUrl = primaryDomain?.hostname
      ? (primaryDomain.hostname.startsWith('localhost') || primaryDomain.hostname.includes('.local')
          ? `http://${primaryDomain.hostname}`
          : `https://${primaryDomain.hostname}`)
      : `${baseUrl}/${site?.slug}`;

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        total: order.total,
        currency: order.currency,
        createdAt: order.createdAt,
      },
      customer: {
        id: order.customer.id,
        email: order.customer.email,
        name: order.customer.name,
      },
      site: site
        ? {
            id: site.id,
            name: site.name,
            slug: site.slug,
            status: site.status,
            internalPort: site.internalPort,
            databaseName: site.databaseName,
            publicUrl,
            adminUrl: `${publicUrl}/admin`,
            createdAt: site.createdAt,
          }
        : null,
      provisioning: {
        jobId: latestJob?.id || null,
        status: latestJob?.status || site?.status || 'QUEUED',
        currentStep: latestJob?.currentStep || 'STEP_VALIDATE',
        retryCount: latestJob?.retryCount || 0,
        errorMessage: latestJob?.errorMessage || null,
        logs: latestJob?.logs || [],
        adminCredentials,
      },
    });
  } catch (err: any) {
    console.error(`[GET /api/orders/${params.id}] Error:`, err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
