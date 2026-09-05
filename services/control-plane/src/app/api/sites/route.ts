import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const status = searchParams.get('status');

    const sites = await prisma.site.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        customer: true,
        product: true,
        version: true,
        domains: true,
        provisionJobs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      count: sites.length,
      sites: sites.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        status: s.status,
        internalPort: s.internalPort,
        databaseName: s.databaseName,
        customer: {
          id: s.customer.id,
          name: s.customer.name,
          email: s.customer.email,
        },
        product: s.product ? { id: s.product.id, name: s.product.name, slug: s.product.slug } : null,
        domains: s.domains.map((d) => ({ hostname: d.hostname, isPrimary: d.isPrimary, verified: d.verified })),
        latestJob: s.provisionJobs[0] || null,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
    });
  } catch (err: any) {
    console.error('[GET /api/sites] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to list sites' },
      { status: 500 }
    );
  }
}
