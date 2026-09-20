import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 50, 2000);
  },
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redis.on("close", () => {
  console.log("Redis connection closed");
});

export function getRedisClient() {
  return redis;
}

export async function shutdownRedis() {
  await redis.quit();
}
