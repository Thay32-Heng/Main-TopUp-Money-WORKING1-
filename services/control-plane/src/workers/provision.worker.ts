import { Worker, Job } from 'bullmq';
import { prisma } from '@/lib/prisma';
import { redisConnectionOptions } from '@/lib/redis';
import { PROVISIONING_QUEUE_NAME, ProvisionJobPayload } from '@/lib/queue';
import { tenantDbService } from '@/services/tenant-db.service';
import { dockerService } from '@/services/docker.service';
import { proxyService } from '@/services/proxy.service';
import { writeLog } from '@/services/logger.service';
import { SiteStatus, ProvisionStatus, LogLevel, OrderStatus } from '@prisma/client';
import http from 'http';

function getWorkerRedisConnection() {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    try {
      const parsed = new URL(redisUrl);
      return {
        host: parsed.hostname || 'localhost',
        port: parseInt(parsed.port || '6379', 10),
        password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
        username: parsed.username ? decodeURIComponent(parsed.username) : undefined,
        ...redisConnectionOptions,
      };
    } catch (e) {}
  }
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    ...redisConnectionOptions,
  };
}

/**
 * Health check polling helper
 */
async function pollHealthz(url: string, maxWaitMs = 30000, intervalMs = 2000): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    try {
      const isOk = await new Promise<boolean>((resolve) => {
        const req = http.get(url, { timeout: 1500 }, (res) => {
          if (res.statusCode === 200) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
        req.on('error', () => resolve(false));
        req.on('timeout', () => {
          req.destroy();
          resolve(false);
        });
      });

      if (isOk) return true;
    } catch {
      // Continue polling
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return false;
}

/**
 * Main Provisioning Pipeline
 */
export async function processProvisionJob(job: Job<ProvisionJobPayload>) {
  const { jobId, siteId, orderId, slug, name, adminEmail, adminInitialPassword, dockerImageTag, topupApiKey, topupApiSecret } =
    job.data;

  console.log(`\n======================================================`);
  console.log(`[Worker] Starting Provisioning Pipeline for Site: "${slug}" (Job: ${jobId})`);
  console.log(`======================================================`);

  const containerName = `site-${slug}`;

  try {
    // ── 1. STEP_VALIDATE ──────────────────────────────────────────────────
    await writeLog(jobId, 'STEP_VALIDATE', `Validating site "${slug}" and payment status...`);

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      include: {
        customer: true,
        product: true,
        version: true,
        order: true,
        domains: true,
      },
    });

    if (!site) {
      throw new Error(`Site record "${siteId}" not found in control plane database`);
    }

    if (site.order && site.order.status !== OrderStatus.PAID) {
      await writeLog(
        jobId,
        'STEP_VALIDATE',
        `Warning: Order ${site.order.id} status is ${site.order.status}. Proceeding with provisioning.`,
        LogLevel.WARN
      );
    } else {
      await writeLog(jobId, 'STEP_VALIDATE', `Validation successful. Site and customer verified.`);
    }

    // ── 2. STEP_DATABASE ──────────────────────────────────────────────────
    await writeLog(jobId, 'STEP_DATABASE', `Provisioning dedicated PostgreSQL tenant database...`);

    const dbResult = await tenantDbService.ensureDatabase(slug);

    await prisma.site.update({
      where: { id: siteId },
      data: {
        databaseName: dbResult.databaseName,
      },
    });

    await writeLog(
      jobId,
      'STEP_DATABASE',
      `Database "${dbResult.databaseName}" created and secured with isolated credentials.`
    );

    // ── 3. STEP_MIGRATE_AND_SEED ──────────────────────────────────────────
    await writeLog(jobId, 'STEP_MIGRATE_AND_SEED', `Applying database schema and seeding store administrator...`);

    const seedResult = await tenantDbService.migrateAndSeed(
      dbResult.databaseUrl,
      adminEmail || site.customer.email,
      adminInitialPassword,
      name || site.name,
      topupApiKey,
      topupApiSecret
    );

    await writeLog(
      jobId,
      'STEP_MIGRATE_AND_SEED',
      `Schema migrated. Store Administrator provisioned (${seedResult.adminEmail}).`
    );

    // ── 4. STEP_DOCKER_DEPLOY ─────────────────────────────────────────────
    const effectiveImage =
      dockerImageTag ||
      site.version?.dockerImageTag ||
      process.env.DEFAULT_TENANT_IMAGE ||
      'topup-template:1.0.0';

    await writeLog(
      jobId,
      'STEP_DOCKER_DEPLOY',
      `Deploying Docker container "${containerName}" with image "${effectiveImage}"...`
    );

    const containerResult = await dockerService.deployTenantContainer({
      slug,
      dockerImage: effectiveImage,
      preferredPort: site.internalPort || undefined,
      env: {
        PORT: '3000',
        BASE_PATH: `/${slug}`,
        DATABASE_URL: dbResult.databaseUrl,
        SITE_NAME: name || site.name,
        ADMIN_EMAIL: seedResult.adminEmail,
        ADMIN_INITIAL_PASSWORD: seedResult.adminPassword,
        TOPUP_API_KEY: topupApiKey || '',
        TOPUP_API_SECRET: topupApiSecret || '',
        JWT_SECRET: process.env.JWT_SECRET || 'tenant-jwt-secret-key-32-chars-min',
      },
    });

    await prisma.site.update({
      where: { id: siteId },
      data: {
        internalPort: containerResult.hostPort,
      },
    });

    await writeLog(
      jobId,
      'STEP_DOCKER_DEPLOY',
      `Container "${containerName}" running. Bound to host port ${containerResult.hostPort}.`
    );

    // ── 5. STEP_ROUTING ───────────────────────────────────────────────────
    await writeLog(jobId, 'STEP_ROUTING', `Configuring dynamic Traefik reverse proxy routing...`);

    const primaryDomain = site.domains.find((d) => d.isPrimary)?.hostname;
    // Route to container on docker bridge network or host port
    const targetUrl = `http://${containerName}:3000`;

    const routeFile = await proxyService.registerTenantRoute(slug, targetUrl, primaryDomain);

    await writeLog(
      jobId,
      'STEP_ROUTING',
      `Dynamic path routing registered for "/${slug}" -> ${targetUrl} (${routeFile}).`
    );

    // ── 6. STEP_HEALTH_CHECK ──────────────────────────────────────────────
    await writeLog(jobId, 'STEP_HEALTH_CHECK', `Running readiness & health checks against container...`);

    const healthUrl = `http://${containerName}:3000/healthz`;
    let healthy = await pollHealthz(healthUrl, 15000, 2000);

    if (!healthy) {
      // Fallback check on subpath /slug/healthz
      const subpathHealthUrl = `http://${containerName}:3000/${slug}/healthz`;
      healthy = await pollHealthz(subpathHealthUrl, 5000, 2000);
    }

    if (!healthy && containerResult.hostPort) {
      // Fallback check on local host port (when worker runs directly on host)
      const hostHealthUrl = `http://127.0.0.1:${containerResult.hostPort}/healthz`;
      healthy = await pollHealthz(hostHealthUrl, 15000, 2000);
    }

    if (!healthy) {
      throw new Error(
        `Health check probe failed after 30 seconds at ${healthUrl}. Container did not respond with HTTP 200.`
      );
    }

    await writeLog(jobId, 'STEP_HEALTH_CHECK', `Health check passed! Tenant instance is healthy.`);

    // ── 7. STEP_FINALIZE ──────────────────────────────────────────────────
    const rootDomain = process.env.ROOT_DOMAIN || 'topupdomain.com';
    const publicUrl = primaryDomain
      ? `https://${primaryDomain}`
      : `http://localhost:${containerResult.hostPort}/${slug}`;

    await prisma.$transaction([
      prisma.site.update({
        where: { id: siteId },
        data: {
          status: SiteStatus.READY,
          internalPort: containerResult.hostPort,
        },
      }),
      prisma.provisionJob.update({
        where: { id: jobId },
        data: {
          status: ProvisionStatus.READY,
          currentStep: 'COMPLETED',
        },
      }),
    ]);

    await writeLog(
      jobId,
      'STEP_FINALIZE',
      `🎉 Tenant Store Provisioning Complete! Store URL: ${publicUrl} | Admin: ${seedResult.adminEmail} / Password: ${seedResult.adminPassword}`
    );

    console.log(`======================================================`);
    console.log(`[Worker] Successfully finished provisioning: "${slug}"`);
    console.log(`======================================================\n`);

    return {
      success: true,
      siteId,
      slug,
      publicUrl,
      adminEmail: seedResult.adminEmail,
      adminPassword: seedResult.adminPassword,
    };
  } catch (err: any) {
    console.error(`[Worker] Pipeline failed for site "${slug}":`, err);

    await writeLog(
      jobId,
      'STEP_FAILED',
      `Provisioning failed: ${err.message}\nStack: ${err.stack || ''}`,
      LogLevel.ERROR
    );

    // Automated cleanup of failed container
    await dockerService.cleanupContainer(containerName).catch(() => {});

    await prisma.$transaction([
      prisma.site.update({
        where: { id: siteId },
        data: {
          status: SiteStatus.FAILED,
        },
      }),
      prisma.provisionJob.update({
        where: { id: jobId },
        data: {
          status: ProvisionStatus.FAILED,
          errorMessage: err.message,
        },
      }),
    ]);

    throw err;
  }
}

/**
 * Provisioning Worker Factory
 */
export function createProvisionWorker() {
  const worker = new Worker<ProvisionJobPayload>(
    PROVISIONING_QUEUE_NAME,
    async (job) => processProvisionJob(job),
    {
      connection: getWorkerRedisConnection(),
      concurrency: parseInt(process.env.WORKER_CONCURRENCY || '2', 10),
    }
  );

  worker.on('completed', (job) => {
    console.log(`[Worker] Job #${job.id} for site "${job.data.slug}" marked COMPLETED.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job #${job?.id} for site "${job?.data.slug}" FAILED:`, err.message);
  });

  return worker;
}

export default createProvisionWorker;
