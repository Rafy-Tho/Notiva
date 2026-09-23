import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { getRedisClient } from "../../config/redis.js";

const redis = getRedisClient();

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
  skip: (req) => req.path.startsWith("/api/v1/auth") || skipTrustedIP(req),
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
});

export const authLimiter = rateLimit({
  ...sharedOptions,
  max: 10,
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
});
