import * as userRepo from "../users/user.repository.js";
import { toPublicUser } from "../users/user.service.js";
import { UAParser } from "ua-parser-js";
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { hashToken } from "../../common/utils/tokens.js";
import { trackLoginAttempt, checkResetRate } from "../../common/utils/rateLimit.js";
import { securityAudit } from "../../common/middleware/securityAudit.js";
import { createSession } from "./session.service.js";
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

  const ua = new UAParser(req.headers["user-agent"]);
  const device = ua.getDevice();
  const session = await createSession({
    userId: user.id,
    deviceName: device.model || req.headers["sec-ch-ua-model"] || "Unknown Device",
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  if (req) securityAudit.successfulLogin(normalizedEmail, req.ip);
  return { user: toPublicUser(user), session };
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

  return toPublicUser(updated);
}
