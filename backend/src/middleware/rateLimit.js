import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const sharedOptions = {
  windowMs: 60_000,
  standardHeaders: true,
  legacyHeaders: false,
};

const trustedIPs = process.env.TRUSTED_IPS?.split(",") || [];

const skipHealthCheck = (req) => req.path === "/";
const skipTrustedIP = (req) => trustedIPs.includes(req.ip);

export const generalLimiter = rateLimit({
  ...sharedOptions,
  max: 100,
  skip: (req) => skipHealthCheck(req) || skipTrustedIP(req),
  store: new RedisStore({
    sendCommand: (...args) => redis.sendCommand(...args),
  }),
});

export const authLimiter = rateLimit({
  ...sharedOptions,
  max: 10,
  store: new RedisStore({
    sendCommand: (...args) => redis.sendCommand(...args),
  }),
});
