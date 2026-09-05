import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SiteStatus, ProvisionStatus, OrderStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const [totalSites, activeSites, provisioningSites, failedSites, orders, totalJobs, successfulJobs] =
      await Promise.all([
        prisma.site.count(),
        prisma.site.count({ where: { status: SiteStatus.READY } }),
        prisma.site.count({ where: { status: SiteStatus.PROVISIONING } }),
        prisma.site.count({ where: { status: SiteStatus.FAILED } }),
        prisma.order.findMany({
          where: { status: OrderStatus.PAID },
          select: { total: true },
        }),
        prisma.provisionJob.count(),
        prisma.provisionJob.count({ where: { status: ProvisionStatus.READY } }),
      ]);

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const successRate = totalJobs > 0 ? Math.round((successfulJobs / totalJobs) * 100) : 100;

    return NextResponse.json({
      success: true,
      metrics: {
        totalSites,
        activeSites,
        provisioningSites,
        failedSites,
        totalRevenue: totalRevenue.toFixed(2),
        totalJobs,
        successfulJobs,
        successRate,
      },
    });
  } catch (err: any) {
    console.error('[GET /api/admin/metrics] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
