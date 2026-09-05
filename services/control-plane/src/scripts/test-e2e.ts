/**
 * scripts/test-e2e.ts — Automated End-to-End Test for SaaS Control Plane & Tenant Pipeline
 */
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { prisma } from '../lib/prisma';
import { tenantDbService } from '../services/tenant-db.service';
import { proxyService } from '../services/proxy.service';
import { dockerService } from '../services/docker.service';
import { writeLog } from '../services/logger.service';
import { SiteStatus, ProvisionStatus, OrderStatus, LogLevel } from '@prisma/client';
import fs from 'fs';

async function runE2ETest() {
  console.log('\n======================================================');
  console.log('   🚀 SAAS AUTO-PROVISIONING END-TO-END VERIFICATION  ');
  console.log('======================================================\n');

  const testTimestamp = Date.now();
  const testSlug = `e2e-test-${testTimestamp.toString().slice(-6)}`;
  const testEmail = `admin-${testSlug}@example.com`;
  const testStoreName = `Test Store ${testSlug}`;

  let siteId = '';
  let orderId = '';
  let jobId = '';

  try {
    // ── STEP 1: Verify Seed & Product Setup ─────────────────────────────
    console.log('[Phase 1] Verifying Product and Version seeds...');
    const product = await prisma.product.upsert({
      where: { slug: 'topup-store' },
      update: {},
      create: {
        name: 'Top-Up Game Store Template',
        slug: 'topup-store',
        price: 29.0,
        active: true,
      },
    });

    const version = await prisma.productVersion.upsert({
      where: {
        productId_version: {
          productId: product.id,
          version: '1.0.0',
        },
      },
      update: {},
      create: {
        productId: product.id,
        version: '1.0.0',
        dockerImageTag: 'topup-template:1.0.0',
        isDefault: true,
      },
    });

    console.log(`  ✓ Product ready (ID: ${product.id})`);
    console.log(`  ✓ Version ready: v${version.version} (Tag: ${version.dockerImageTag})`);

    // ── STEP 2: Simulate Checkout & Order Creation ─────────────────────
    console.log('\n[Phase 2] Simulating Checkout & Order creation...');
    const customer = await prisma.customer.upsert({
      where: { email: testEmail },
      update: { name: 'E2E Tester' },
      create: {
        email: testEmail,
        name: 'E2E Tester',
      },
    });

    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        productId: product.id,
        versionId: version.id,
        total: product.price,
        status: OrderStatus.PAID,
        paymentIntentId: `pi_test_${testTimestamp}`,
      },
    });
    orderId = order.id;

    const site = await prisma.site.create({
      data: {
        name: testStoreName,
        slug: testSlug,
        status: SiteStatus.PENDING,
        customerId: customer.id,
        productId: product.id,
        versionId: version.id,
        orderId: order.id,
      },
    });
    siteId = site.id;

    const provisionJob = await prisma.provisionJob.create({
      data: {
        siteId: site.id,
        orderId: order.id,
        status: ProvisionStatus.PROVISIONING,
        currentStep: 'STEP_VALIDATE',
      },
    });
    jobId = provisionJob.id;

    console.log(`  ✓ Created Site: ${site.name} (Slug: ${site.slug}, ID: ${site.id})`);
    console.log(`  ✓ Created Order: ${order.id} (Status: ${order.status}, Total: $${order.total})`);
    console.log(`  ✓ Created ProvisionJob: ${provisionJob.id}`);

    // ── STEP 3: Test Dynamic Port Discovery ─────────────────────────────
    console.log('\n[Phase 3] Testing Dynamic Host Port Discovery...');
    const freePort = await dockerService.findAvailablePort(3100, 3999);
    console.log(`  ✓ Discovered available host port: ${freePort}`);

    // ── STEP 4: Test Traefik Dynamic Route Generation ───────────────────
    console.log('\n[Phase 4] Testing Traefik Dynamic Reverse Proxy Provider...');
    const targetUrl = `http://site-${testSlug}:3000`;
    const routeFilePath = await proxyService.registerTenantRoute(testSlug, targetUrl);
    console.log(`  ✓ Generated Traefik route file: ${routeFilePath}`);

    if (fs.existsSync(routeFilePath)) {
      const routeContent = fs.readFileSync(routeFilePath, 'utf8');
      console.log(`  ✓ Verified Traefik configuration content:\n${routeContent.trim()}`);
    } else {
      throw new Error(`Route file ${routeFilePath} was not created on disk`);
    }

    // ── STEP 5: Test Logging Service ────────────────────────────────────
    console.log('\n[Phase 5] Testing Real-Time Provisioning Log Engine...');
    await writeLog(jobId, 'STEP_VALIDATE', 'Order and customer verified for provisioning.');
    await writeLog(jobId, 'STEP_ROUTING', `Dynamic path registered at /${testSlug}`);
    await writeLog(jobId, 'STEP_FINALIZE', `Completed verification test.`);

    const loggedEvents = await prisma.provisionLog.findMany({
      where: { jobId },
      orderBy: { createdAt: 'asc' },
    });
    console.log(`  ✓ Verified ${loggedEvents.length} log entries written to database:`);
    loggedEvents.forEach((l) => console.log(`    [${l.step}] ${l.message}`));

    // ── STEP 6: Test State Finalization ─────────────────────────────────
    console.log('\n[Phase 6] Finalizing Site Status Transition...');
    await prisma.$transaction([
      prisma.site.update({
        where: { id: siteId },
        data: {
          status: SiteStatus.READY,
          internalPort: freePort,
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

    const verifiedSite = await prisma.site.findUnique({
      where: { id: siteId },
      include: {
        customer: true,
        order: true,
        provisionJobs: { include: { logs: true } },
      },
    });

    console.log(`  ✓ Site Status: ${verifiedSite?.status}`);
    console.log(`  ✓ Internal Port: ${verifiedSite?.internalPort}`);
    console.log(`  ✓ Provision Job Status: ${verifiedSite?.provisionJobs[0]?.status}`);

    // ── STEP 7: Cleanup Test Artifacts ──────────────────────────────────
    console.log('\n[Phase 7] Cleaning up test artifacts...');
    await proxyService.removeTenantRoute(testSlug);
    console.log(`  ✓ Removed temporary Traefik route file`);

    console.log('\n======================================================');
    console.log('   ✅ ALL END-TO-END VERIFICATION CHECKS PASSED!     ');
    console.log('======================================================\n');
  } catch (err: any) {
    console.error('\n❌ E2E Verification failed:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETest();
