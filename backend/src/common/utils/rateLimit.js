import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export async function trackLoginAttempt(email) {
  const key = `login_attempts:${email}`;
  const lockedKey = `login_locked:${email}`;

  const isLocked = await redis.exists(lockedKey);
  if (isLocked) {
    return { locked: true, remaining: await redis.ttl(lockedKey) };
  }

  const attempts = await redis.incr(key);
  if (attempts === 1) {
    await redis.expire(key, 3600);
  }

  const threshold = parseInt(process.env.ACCOUNT_LOCKOUT_THRESHOLD || "5", 10);
  const duration = parseInt(process.env.ACCOUNT_LOCKOUT_DURATION || "900000", 10);

  if (attempts >= threshold) {
    await redis.setex(lockedKey, duration / 1000, "1");
    await redis.del(key);
    return { locked: true, remaining: duration / 1000 };
  }

  return { locked: false, attempts, remaining: threshold - attempts };
}

export async function checkResetRate(email) {
  const key = `password_reset:${email}`;
  const attempts = await redis.incr(key);

  if (attempts === 1) {
    await redis.expire(key, 3600);
  }

  return attempts <= 5;
}
