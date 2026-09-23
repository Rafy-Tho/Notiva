import { Redis } from "ioredis";
import { logger } from "../common/utils/logger.js";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 50, 2000);
  },
});

redis.on("error", (err) => {
  logger.error("Redis connection error:", err.message);
});

redis.on("close", () => {
  logger.info("Redis connection closed");
});

export function getRedisClient() {
  return redis;
}

export async function shutdownRedis() {
  await redis.quit();
}
