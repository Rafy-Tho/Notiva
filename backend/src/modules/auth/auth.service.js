import { User } from "../../models/User.js";
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { signToken, hashToken } from "../../common/utils/tokens.js";
import { securityAudit } from "../../common/middleware/securityAudit.js";
import { ConflictError, UnauthorizedError, BadRequestError } from "../../common/errors/errors.js";

export async function register({ name, email, password }) {
  const existing = await User.findOne({ email });

  if (existing) {
    throw new ConflictError("User already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    password: passwordHash,
  });

  return user;
}

export async function login({ email, password }, req) {
  const user = await User.findOne({ email });

  if (!user) {
    if (req) securityAudit.failedLogin(email, req.ip);
    throw new UnauthorizedError("Invalid credentials");
  }

  if (user.deletedAt) {
    if (req) securityAudit.failedLogin(email, req.ip);
    throw new UnauthorizedError("Account is deleted");
  }

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    if (req) securityAudit.failedLogin(email, req.ip);
    throw new UnauthorizedError("Invalid credentials");
  }

  if (req) securityAudit.successfulLogin(email, req.ip);
  return user;
}

export function issueToken(user) {
  const accessToken = signToken(user.id);
  return { accessToken, user };
}

export async function createResetToken(email) {
  const user = await User.findOne({ email });

  if (!user) return null;

  const raw = crypto.randomBytes(32).toString("hex");

  user.resetToken = hashToken(raw);
  user.resetTokenExpires = new Date(Date.now() + 3600_000);

  await user.save();

  return { user, token: raw };
}

export async function consumeResetToken(token, newPassword) {
  const user = await User.findOne({
    resetToken: hashToken(token),
    resetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new BadRequestError("Invalid or expired token");
  }

  user.password = await bcrypt.hash(newPassword, 12);
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;

  await user.save();

  return user;
}
