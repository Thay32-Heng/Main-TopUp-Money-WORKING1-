import Redis, { RedisOptions } from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisConnectionOptions: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
};

const globalForRedis = globalThis as unknown as {
  redisClient: Redis | undefined;
};

export function createRedisClient(): Redis {
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL, redisConnectionOptions);
  }

  return new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    ...redisConnectionOptions,
  });
}

export const redis = globalForRedis.redisClient ?? createRedisClient();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redisClient = redis;
}

export default redis;
