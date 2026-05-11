import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
  windowMs: 60_000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 60_000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});
