import * as userRepo from "../users/user.repository.js";
import { toPublicUser } from "../users/user.service.js";
import { UAParser } from "ua-parser-js";
import bcrypt from "bcrypt";
import { hashToken } from "../../common/utils/tokens.js";
import { trackLoginAttempt, checkResetRate, checkVerificationRate } from "../../common/utils/rateLimit.js";
import { securityAudit } from "../../common/middleware/securityAudit.js";
import { createSession } from "./session.service.js";
import * as emailVerificationRepo from "./email_verification.repository.js";
import * as passwordResetRepo from "./password_reset.repository.js";
import {
  ConflictError,
  UnauthorizedError,
  BadRequestError,
  TooManyRequestsError,
} from "../../common/errors/errors.js";

const VERIFICATION_CODE_LENGTH = 6;
const TOKEN_EXPIRY_MS = 15 * 60 * 1000;

function generateVerificationCode() {
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
}

function hashCode(code) {
  return hashToken(code);
}

export { checkResetRate };
export { generateVerificationCode, hashCode };

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

  try {
    await emailVerificationRepo.createToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });
  } catch (err) {
  }

  return { code, userId: user.id };
}

export async function verifyCode(email, code) {
  const normalizedEmail = email.toLowerCase();
  const user = await userRepo.findByEmail(normalizedEmail);

  if (!user) {
    throw new UnauthorizedError("Invalid verification code");
  }

  if (user.emailVerifiedAt) {
    throw new BadRequestError("Email already verified");
  }

  const tokenHash = hashCode(code);
  const token = await emailVerificationRepo.findByTokenHash(tokenHash);

  if (!token || token.userId !== user.id) {
    throw new UnauthorizedError("Invalid or expired verification code");
  }

  await emailVerificationRepo.markEmailVerified(user.id, new Date());
  await emailVerificationRepo.markAsUsed(token.id);

  const session = await createSession({
    userId: user.id,
    deviceName: "Unknown Device",
    ipAddress: "0.0.0.0",
    userAgent: "email-verification",
  });

  return {
    user: toPublicUser(user),
    session,
  };
}

export async function sendPasswordResetCode(email) {
  const normalizedEmail = email.toLowerCase();
  const user = await userRepo.findByEmail(normalizedEmail);

  if (!user) {
    return { sent: false };
  }

  if (!user.emailVerifiedAt) {
    throw new UnauthorizedError("Please verify your email first");
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

  return { code, userId: user.id };
}

export async function resetPasswordWithCode(email, code, newPassword) {
  const normalizedEmail = email.toLowerCase();
  const user = await userRepo.findByEmail(normalizedEmail);

  if (!user) {
    throw new UnauthorizedError("Invalid reset code");
  }

  const tokenHash = hashCode(code);
  const token = await passwordResetRepo.findByTokenHash(tokenHash);

  if (!token || token.userId !== user.id) {
    throw new UnauthorizedError("Invalid or expired reset code");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await userRepo.update(user.id, { password: passwordHash });
  await passwordResetRepo.markAsUsed(token.id);

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
