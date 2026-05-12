// Import the User model for interacting with the users collection
import { User } from "../models/User.js";

// Built-in Node.js crypto module for generating secure random tokens
import crypto from "node:crypto";

// bcrypt library for hashing and comparing passwords securely
import bcrypt from "bcrypt";

// Import token helper functions
import {
  hashToken, // Hash refresh/reset tokens before storing in DB
  signAccess, // Create access JWT
  signRefresh, // Create refresh JWT
  verifyRefresh, // Verify refresh JWT
} from "../utils/tokens.js";

// Import RefreshToken model for storing refresh sessions
import { RefreshToken } from "../models/RefreshToken.js";

// Number of days refresh token remains valid
const REFRESH_DAYS = 7;

/**
 * Register a new user
 */
export async function register({ name, email, password }) {
  // Check if user already exists with this email
  const existing = await User.findOne({ email });

  if (existing) {
    // Create custom error
    const e = new Error("User already exists");
    e.status = 409; // Conflict
    throw e;
  }

  // Hash password before saving
  const passwordHash = await bcrypt.hash(password, 12);

  // Create new user in database
  const user = await User.create({
    name,
    email,
    password: passwordHash,
  });

  // Return created user
  return user;
}

/**
 * Login user using email + password
 */
export async function login({ email, password }) {
  // Find user by email
  const user = await User.findOne({ email });

  // User not found
  if (!user) {
    const e = new Error("Invalid credentials");
    e.status = 401; // Unauthorized
    throw e;
  }

  // Compare entered password with hashed password
  const ok = await bcrypt.compare(password, user.password);

  // Password incorrect
  if (!ok) {
    const e = new Error("Invalid credentials");
    e.status = 401;
    throw e;
  }

  // Login successful
  return user;
}

/**
 * Create access + refresh tokens
 */
export async function issueTokens(user, meta = {}) {
  // Generate short-lived access token
  const accessToken = signAccess(user.id);

  // Generate long-lived refresh token
  const refreshToken = signRefresh(user.id);

  // Store hashed refresh token in database
  await RefreshToken.create({
    token: hashToken(refreshToken), // Never store raw token
    userId: user.id,

    // Expiration date
    expiresAt: new Date(Date.now() + REFRESH_DAYS * 86400_000),

    // Optional metadata
    userAgent: meta.userAgent,
    ip: meta.ip,
  });

  // Return raw tokens to client
  return { accessToken, refreshToken };
}

/**
 * Rotate refresh token
 * Old refresh token becomes invalid
 */
export async function rotateRefresh(oldToken, meta = {}) {
  let payload;

  try {
    // Verify JWT signature and expiration
    payload = verifyRefresh(oldToken);
  } catch {
    // Invalid or expired JWT
    const e = new Error("Invalid refresh token");
    e.status = 401;
    throw e;
  }

  // Find stored refresh token in database
  const stored = await RefreshToken.findOne({
    token: hashToken(oldToken),
  });

  // Token not found
  if (!stored) {
    const e = new Error("Invalid refresh token");
    e.status = 401;
    throw e;
  }

  // Delete old refresh token
  // This prevents reuse attacks
  await stored.deleteOne();

  // Find associated user
  const user = await User.findById(payload.sub);

  // User no longer exists
  if (!user) {
    const e = new Error("User not found");
    e.status = 404;
    throw e;
  }

  // Create new access + refresh token pair
  return issueTokens(user, meta);
}

/**
 * Create password reset token
 */
export async function createResetToken(email) {
  // Find user by email
  const user = await User.findOne({ email });

  // Return null if user doesn't exist
  // Avoid revealing if email exists
  if (!user) return null;

  // Generate secure random token
  const raw = crypto.randomBytes(32).toString("hex");

  // Store hashed token in database
  user.resetToken = hashToken(raw);

  // Token expires in 1 hour
  user.resetTokenExpires = new Date(Date.now() + 3600_000);

  // Save changes
  await user.save();

  // Return raw token for email link
  return { user, token: raw };
}

/**
 * Reset password using reset token
 */
export async function consumeResetToken(token, newPassword) {
  // Find user with matching valid token
  const user = await User.findOne({
    resetToken: hashToken(token),

    // Ensure token has not expired
    resetTokenExpires: { $gt: Date.now() },
  });

  // Invalid or expired token
  if (!user) {
    const e = new Error("Invalid or expired token");
    e.status = 400;
    throw e;
  }

  // Hash new password
  user.password = await bcrypt.hash(newPassword, 12);

  // Remove reset token after use
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;

  // Save updated password
  await user.save();

  // Return updated user
  return user;
}

/**
 * Cookie configuration for refresh token
 */
export const cookieOpts = () => ({
  // Prevent JavaScript access to cookie
  httpOnly: true,

  // HTTPS only in production
  secure: process.env.NODE_ENV === "production",

  // Cross-site cookie policy
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

  // Cookie lifetime
  maxAge: REFRESH_DAYS * 86400_000,

  // Cookie available on all routes
  path: "/",
});

export async function revokeRefresh(token) {
  if (!token) return;
  await RefreshToken.deleteOne({ token: hashToken(token) });
}
