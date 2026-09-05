/**
 * scripts/start-worker.ts — Standalone Provisioning Worker Process
 *
 * Runs the BullMQ background worker consuming from `provisioning-queue`.
 * Executes the full tenant provisioning pipeline (DB -> Seed -> Docker -> Routing -> Health Check).
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { createProvisionWorker } from '../workers/provision.worker';

console.log(`
╔════════════════════════════════════════════════════════════════╗
║   Ahnajak Topup SaaS — Provisioning Worker                     ║
║   Queue:       provisioning-queue                              ║
║   Concurrency: ${process.env.WORKER_CONCURRENCY || 2}                                              ║
║   Status:      RUNNING & LISTENING FOR JOBS                    ║
╚════════════════════════════════════════════════════════════════╝
`);

const worker = createProvisionWorker();

// Graceful Shutdown
async function shutdown(signal: string) {
  console.log(`\n[Worker] Received ${signal}. Gracefully closing worker...`);
  try {
    await worker.close();
    console.log('[Worker] Worker closed cleanly.');
    process.exit(0);
  } catch (err: any) {
    console.error('[Worker] Error during shutdown:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
