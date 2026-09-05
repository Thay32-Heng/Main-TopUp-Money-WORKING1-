import { Queue } from 'bullmq';
import { redisConnectionOptions } from './redis';

export interface ProvisionJobPayload {
  jobId: string;
  siteId: string;
  orderId?: string | null;
  slug: string;
  name: string;
  adminEmail: string;
  adminInitialPassword?: string;
  topupApiKey?: string;
  topupApiSecret?: string;
  dockerImageTag?: string;
}

export const PROVISIONING_QUEUE_NAME = 'provisioning-queue';

function getQueueConnectionConfig() {
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
    } catch (e) {
      // Fallback
    }
  }

  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    ...redisConnectionOptions,
  };
}

const globalForQueue = globalThis as unknown as {
  provisioningQueue: Queue<ProvisionJobPayload> | undefined;
};

export const provisioningQueue =
  globalForQueue.provisioningQueue ??
  new Queue<ProvisionJobPayload>(PROVISIONING_QUEUE_NAME, {
    connection: getQueueConnectionConfig(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: {
        age: 24 * 3600, // keep for 24h
        count: 1000,
      },
      removeOnFail: {
        age: 7 * 24 * 3600, // keep for 7 days
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForQueue.provisioningQueue = provisioningQueue;
}

/**
 * Helper to dispatch a provision job to BullMQ
 */
export async function dispatchProvisionJob(payload: ProvisionJobPayload) {
  try {
    const job = await provisioningQueue.add(`provision-${payload.slug}`, payload, {
      jobId: payload.jobId,
    });
    console.log(`[Queue] Dispatched provision job #${job.id} for site slug "${payload.slug}"`);
    return job;
  } catch (err: any) {
    console.warn(`[Queue] Warning: Could not enqueue job to Redis (${err.message}). In offline development, verify Redis is running.`);
    return null;
  }
}

export default provisioningQueue;
