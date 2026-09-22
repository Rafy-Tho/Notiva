import * as userRepo from "../users/user.repository.js";
import { toPublicUser } from "../users/user.service.js";
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { signToken, hashToken } from "../../common/utils/tokens.js";
import { trackLoginAttempt, checkResetRate } from "../../common/utils/rateLimit.js";
import { securityAudit } from "../../common/middleware/securityAudit.js";
import { getRedisClient } from "../../config/redis.js";
import {
  ConflictError,
  UnauthorizedError,
  BadRequestError,
  TooManyRequestsError,
} from "../../common/errors/errors.js";

export { checkResetRate };

export async function register({ name, email, password }) {
  const normalizedEmail = email.toLowerCase();
  const existing = await userRepo.findByEmail(normalizedEmail);

  if (existing) {
    throw new ConflictError("User already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await userRepo.create({
    name,
    email: normalizedEmail,
    password: passwordHash,
  });

  return toPublicUser(user);
}

export async function login({ email, password }, req) {
  const normalizedEmail = email.toLowerCase();
  const rateResult = await trackLoginAttempt(normalizedEmail);

  if (rateResult.locked) {
    throw new TooManyRequestsError("Account temporarily locked. Please try again later.");
  }

  const user = await userRepo.findByEmail(normalizedEmail);

  if (!user) {
    if (req) securityAudit.failedLogin(normalizedEmail, req.ip);
    throw new UnauthorizedError("Invalid credentials");
  }

  if (user.deletedAt) {
    if (req) securityAudit.failedLogin(normalizedEmail, req.ip);
    throw new UnauthorizedError("Account is deleted");
  }

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    if (req) securityAudit.failedLogin(normalizedEmail, req.ip);
    throw new UnauthorizedError("Invalid credentials");
  }

  const redis = getRedisClient();
  await redis.del(`login_attempts:${normalizedEmail}`);
  await redis.del(`login_locked:${normalizedEmail}`);

  if (req) securityAudit.successfulLogin(normalizedEmail, req.ip);
  return toPublicUser(user);
}

export function issueToken(user) {
  const accessToken = signToken(user.id);
  return { accessToken, user };
}

export async function createResetToken(email) {
  const normalizedEmail = email.toLowerCase();
  const user = await userRepo.findByEmail(normalizedEmail);

  if (!user) return null;

  const raw = crypto.randomBytes(32).toString("hex");

  const updated = await userRepo.setResetToken(user.id, {
    resetToken: hashToken(raw),
    resetTokenExpires: new Date(Date.now() + 3600_000),
  });

  return { user: toPublicUser(updated), token: raw };
}

export async function consumeResetToken(token, newPassword) {
  const user = await userRepo.findByResetToken(hashToken(token));

  if (!user) {
    throw new BadRequestError("Invalid or expired token");
  }

  const password = await bcrypt.hash(newPassword, 12);
  const updated = await userRepo.update(user.id, {
    password,
    resetToken: null,
    resetTokenExpires: null,
  });

  const redis = getRedisClient();
  await redis.del(`password_reset:${updated.email}`);

  return toPublicUser(updated);
}
