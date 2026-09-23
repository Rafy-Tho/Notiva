import crypto from "node:crypto";
import * as userRepo from "../users/user.repository.js";
import { toPublicUser } from "../users/user.service.js";
import { UAParser } from "ua-parser-js";
import bcrypt from "bcrypt";
import { hashToken } from "../../common/utils/tokens.js";
import {
  trackLoginAttempt,
  resetLoginAttempts,
  checkResetRate,
  checkVerificationRate,
} from "../../common/utils/rateLimit.js";
import { securityAudit } from "../../common/middleware/securityAudit.js";
import { createSession, revokeAllSessions } from "./session.service.js";
import * as emailVerificationRepo from "./email_verification.repository.js";
import * as passwordResetRepo from "./password_reset.repository.js";
import {
  ConflictError,
  UnauthorizedError,
  BadRequestError,
  TooManyRequestsError,
} from "../../common/errors/errors.js";

const TOKEN_EXPIRY_MS = 15 * 60 * 1000;

function generateVerificationCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashCode(code) {
  return hashToken(code);
}

function buildSessionContext(req) {
  if (!req) {
    return { deviceName: "Unknown Device", ipAddress: "0.0.0.0", userAgent: "unknown" };
  }
  const ua = new UAParser(req.headers["user-agent"]);
  const device = ua.getDevice();
  return {
    deviceName: device.model || req.headers["sec-ch-ua-model"] || "Unknown Device",
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  };
}

export { checkResetRate };
export { generateVerificationCode, hashCode, buildSessionContext };

export async function register({ name, email, password }) {
  const normalizedEmail = email.toLowerCase();
  const existing = await userRepo.findByEmail(normalizedEmail);

  if (existing) {
    if (!existing.emailVerifiedAt) {
      return { user: toPublicUser(existing), isNewUser: false };
    }
    throw new ConflictError("User already exists and is verified");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await userRepo.create({
    name,
    email: normalizedEmail,
    password: passwordHash,
  });

  return { user: toPublicUser(user), isNewUser: true };
}

export async function sendVerificationCode(email) {
  const normalizedEmail = email.toLowerCase();
  const user = await userRepo.findByEmail(normalizedEmail);

  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  if (user.emailVerifiedAt) {
    throw new BadRequestError("Email already verified");
  }

  const rateResult = await checkVerificationRate(normalizedEmail);
  if (!rateResult) {
    throw new TooManyRequestsError("Too many verification codes requested. Please try again later.");
  }

  const code = generateVerificationCode();
  const tokenHash = hashCode(code);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

  await emailVerificationRepo.deleteByUserId(user.id);
  await emailVerificationRepo.createToken({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  return { code, userId: user.id };
}

export async function verifyCode(email, code, req) {
  const normalizedEmail = email.toLowerCase();
  const user = await userRepo.findByEmail(normalizedEmail);

  if (!user) {
    throw new UnauthorizedError("Invalid verification code");
  }

  if (user.emailVerifiedAt) {
    throw new BadRequestError("Email already verified");
  }

  const tokenHash = hashCode(code);
  const token = await emailVerificationRepo.findByUserIdAndTokenHash(user.id, tokenHash);

  if (!token) {
    throw new UnauthorizedError("Invalid or expired verification code");
  }

  const verifiedUser = await emailVerificationRepo.markEmailVerified(user.id, new Date());
  await emailVerificationRepo.markAsUsed(token.id);

  const session = await createSession({
    userId: user.id,
    ...buildSessionContext(req),
  });

  return {
    user: toPublicUser(verifiedUser),
    session,
  };
}

export async function sendPasswordResetCode(email) {
  const normalizedEmail = email.toLowerCase();
  const user = await userRepo.findByEmail(normalizedEmail);

  if (!user || !user.emailVerifiedAt) {
    return { sent: false };
  }

  const rateResult = await checkResetRate(normalizedEmail);
  if (!rateResult) {
    throw new TooManyRequestsError("Too many password reset codes requested. Please try again later.");
  }

  const code = generateVerificationCode();
  const tokenHash = hashCode(code);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

  await passwordResetRepo.deleteByUserId(user.id);

  await passwordResetRepo.createToken({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  return { sent: true, code, userId: user.id };
}

export async function resetPasswordWithCode(email, code, newPassword) {
  const normalizedEmail = email.toLowerCase();
  const user = await userRepo.findByEmail(normalizedEmail);

  if (!user) {
    throw new UnauthorizedError("Invalid reset code");
  }

  const tokenHash = hashCode(code);
  const token = await passwordResetRepo.findByUserIdAndTokenHash(user.id, tokenHash);

  if (!token) {
    throw new UnauthorizedError("Invalid or expired reset code");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await userRepo.update(user.id, { password: passwordHash });
  await passwordResetRepo.markAsUsed(token.id);
  await revokeAllSessions(user.id);

  return { user: toPublicUser(user) };
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

  if (!user.emailVerifiedAt) {
    if (req) securityAudit.failedLogin(normalizedEmail, req.ip);
    throw new UnauthorizedError("Email not verified");
  }

  await resetLoginAttempts(normalizedEmail);

  const session = await createSession({
    userId: user.id,
    ...buildSessionContext(req),
  });

  if (req) securityAudit.successfulLogin(normalizedEmail, req.ip);
  return { user: toPublicUser(user), session };
}


