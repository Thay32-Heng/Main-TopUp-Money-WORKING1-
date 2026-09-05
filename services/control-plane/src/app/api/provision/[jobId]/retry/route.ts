import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { dispatchProvisionJob } from '@/lib/queue';
import { ProvisionStatus, SiteStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    const existingJob = await prisma.provisionJob.findUnique({
      where: { id: jobId },
      include: {
        site: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!existingJob) {
      return NextResponse.json({ error: 'Provision job not found' }, { status: 404 });
    }

    // Reset status to QUEUED
    await prisma.$transaction([
      prisma.provisionJob.update({
        where: { id: jobId },
        data: {
          status: ProvisionStatus.QUEUED,
          currentStep: 'QUEUED',
          errorMessage: null,
        },
      }),
      prisma.site.update({
        where: { id: existingJob.siteId },
        data: {
          status: SiteStatus.PROVISIONING,
        },
      }),
    ]);

    // Dispatch job to BullMQ
    await dispatchProvisionJob({
      jobId: existingJob.id,
      siteId: existingJob.siteId,
      slug: existingJob.site.slug,
      name: existingJob.site.name,
      adminEmail: existingJob.site.customer.email,
    });

    return NextResponse.json({
      success: true,
      message: `Provisioning job "${jobId}" has been re-queued for execution.`,
      jobId,
    });
  } catch (err: any) {
    console.error(`[POST /api/provision/${params.jobId}/retry] Error:`, err);
    return NextResponse.json(
      { error: err.message || 'Failed to retry provisioning job' },
      { status: 500 }
    );
  }
}
