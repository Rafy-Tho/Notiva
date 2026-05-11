import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import {
  hashToken,
  signAccess,
  signRefresh,
  verifyRefresh,
} from "../utils/tokens.js";
import { RefreshToken } from "../models/RefreshToken.js";
const REFRESH_DAYS = 7;

export async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    const e = new Error("User already exists");
    e.status = 409;
    throw e;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: passwordHash });
  return user;
}

export async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    const e = new Error("Invalid credentials");
    e.status = 401;
    throw e;
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    const e = new Error("Invalid credentials");
    e.status = 401;
    throw e;
  }
  return user;
}

export async function issueTokens(user, meta = {}) {
  const accessToken = signAccess(user.id);
  const refreshToken = signRefresh(user.id);
  await RefreshToken.create({
    token: hashToken(refreshToken),
    userId: user.id,
    expiresAt: new Date(Date.now() + REFRESH_DAYS * 86400_000), // 7 days
    userAgent: meta.userAgent,
    ip: meta.ip,
  });
  return { accessToken, refreshToken };
}

export async function rotateRefresh(oldToken, meta = {}) {
  let payload;

  try {
    payload = verifyRefresh(oldToken);
  } catch {
    const e = new Error("Invalid refresh token");
    e.status = 401;
    throw e;
  }

  const stored = await RefreshToken.findOne({ token: hashToken(oldToken) });

  if (!stored) {
    const e = new Error("Invalid refresh token");
    e.status = 401;
    throw e;
  }

  await stored.deleteOne();

  const user = await User.findById(payload.sub);

  if (!user) {
    const e = new Error("User not found");
    e.status = 404;
    throw e;
  }
  return issueTokens(user, meta);
}

export const cookieOpts = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: REFRESH_DAYS * 86400_000,
  path: "/",
});
