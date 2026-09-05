import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    const job = await prisma.provisionJob.findUnique({
      where: { id: jobId },
      include: {
        site: {
          include: {
            customer: true,
            domains: true,
          },
        },
        logs: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: `Provision job "${jobId}" not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      provisioning: {
        id: job.id,
        siteId: job.siteId,
        status: job.status,
        currentStep: job.currentStep,
        errorMessage: job.errorMessage,
        logs: job.logs.map((l) => ({
          id: l.id,
          step: l.step,
          level: l.level,
          message: l.message,
          timestamp: l.createdAt.toISOString(),
        })),
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
      },
      site: {
        id: job.site.id,
        name: job.site.name,
        slug: job.site.slug,
        status: job.site.status,
        internalPort: job.site.internalPort,
        customer: {
          name: job.site.customer.name,
          email: job.site.customer.email,
        },
        domains: job.site.domains,
      },
    });
  } catch (err: any) {
    console.error(`[GET /api/provision/${params.jobId}] Error:`, err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch provision job' },
      { status: 500 }
    );
  }
}
