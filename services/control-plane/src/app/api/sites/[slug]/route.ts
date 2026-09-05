import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { dockerService } from '@/services/docker.service';
import { proxyService } from '@/services/proxy.service';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const site = await prisma.site.findFirst({
      where: {
        OR: [{ id: slug }, { slug: slug.toLowerCase() }],
      },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        version: {
          select: {
            id: true,
            version: true,
            dockerImageTag: true,
          },
        },
        domains: {
          orderBy: {
            isPrimary: 'desc',
          },
        },
        order: {
          select: {
            id: true,
            total: true,
            currency: true,
            status: true,
            createdAt: true,
          },
        },
        provisionJobs: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
          include: {
            logs: {
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
    });

    if (!site) {
      return NextResponse.json({ error: `Site "${slug}" not found` }, { status: 404 });
    }

    const primaryDomain = site.domains.find((d) => d.isPrimary) || site.domains[0];
    const baseUrl = process.env.PUBLIC_GATEWAY_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const publicUrl = primaryDomain?.hostname
      ? (primaryDomain.hostname.startsWith('localhost') || primaryDomain.hostname.includes('.local')
          ? `http://${primaryDomain.hostname}`
          : `https://${primaryDomain.hostname}`)
      : `${baseUrl}/${site.slug}`;

    const latestJob = site.provisionJobs[0] || null;

    return NextResponse.json({
      success: true,
      site: {
        id: site.id,
        name: site.name,
        slug: site.slug,
        status: site.status,
        internalPort: site.internalPort,
        databaseName: site.databaseName,
        publicUrl,
        createdAt: site.createdAt,
        updatedAt: site.updatedAt,
        customer: site.customer,
        product: site.product,
        version: site.version,
        domains: site.domains,
        order: site.order,
        latestJob,
        provisioning: {
          currentJobId: latestJob?.id || null,
          status: latestJob?.status || null,
          currentStep: latestJob?.currentStep || null,
          retryCount: latestJob?.retryCount || 0,
          errorMessage: latestJob?.errorMessage || null,
          logs: latestJob?.logs || [],
        },
      },
    });
  } catch (err: any) {
    console.error(`[GET /api/sites/${params.slug}] Error:`, err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const site = await prisma.site.findFirst({
      where: {
        OR: [{ id: slug }, { slug: slug.toLowerCase() }],
      },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    const containerName = `site-${site.slug}`;
    await dockerService.cleanupContainer(containerName).catch(() => {});
    await proxyService.removeTenantRoute(site.slug).catch(() => {});

    await prisma.site.delete({
      where: { id: site.id },
    });

    return NextResponse.json({
      success: true,
      message: `Site "${site.slug}" and associated container deleted successfully.`,
    });
  } catch (err: any) {
    console.error(`[DELETE /api/sites/${params.slug}] Error:`, err);
    return NextResponse.json(
      { error: err.message || 'Failed to delete site' },
      { status: 500 }
    );
  }
}
