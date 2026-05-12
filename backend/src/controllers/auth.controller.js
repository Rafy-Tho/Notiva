// Import all authentication service functions
// Example: register, login, issueTokens, rotateRefresh, etc.
import * as svc from "../services/auth.service.js";

// Import email sending service
import { sendResetEmail } from "../services/email.service.js";

// Import standardized success response helper
import { ok } from "../utils/response.js";

/**
 * Extract request metadata
 * Useful for refresh token tracking/security
 */
const meta = (req) => ({
  // Browser/device information
  userAgent: req.headers["user-agent"],

  // User IP address
  ip: req.ip,
});

/**
 * Register new user
 */
export async function register(req, res) {
  // Create user account
  const user = await svc.register(req.body);

  // Generate access + refresh tokens
  const tokens = await svc.issueTokens(user, meta(req));

  // Store refresh token in secure HTTP-only cookie
  res.cookie(
    "rt", // cookie name
    tokens.refreshToken,
    svc.cookieOpts(),
  );

  // Send success response
  return ok(
    res,
    {
      user,
      accessToken: tokens.accessToken,
    },
    "registered",
    201, // HTTP Created
  );
}

/**
 * Login existing user
 */
export async function login(req, res) {
  // Validate email + password
  const user = await svc.login(req.body);

  // Create new tokens
  const tokens = await svc.issueTokens(user, meta(req));

  // Save refresh token in cookie
  res.cookie("rt", tokens.refreshToken, svc.cookieOpts());

  // Return access token + user
  return ok(
    res,
    {
      user,
      accessToken: tokens.accessToken,
    },
    "logged in",
  );
}

/**
 * Refresh expired access token
 */
export async function refresh(req, res) {
  // Get refresh token from cookies
  const token = req.cookies?.rt;

  // Rotate refresh token
  // Old token becomes invalid
  const tokens = await svc.rotateRefresh(token, meta(req));

  // Save new refresh token
  res.cookie("rt", tokens.refreshToken, svc.cookieOpts());

  // Return new access token
  return ok(res, {
    accessToken: tokens.accessToken,
  });
}

/**
 * Forgot password handler
 */
export async function forgotPassword(req, res) {
  // Create reset token if email exists
  const result = await svc.createResetToken(req.body.email);

  // Only send email if account exists
  if (result) {
    // Build password reset URL
    const link = `${
      process.env.FRONTEND_ORIGIN.split(",")[0]
    }/reset-password?token=${result.token}`;

    // Send reset email

    await sendResetEmail(result.user.email, link);
  }

  // Always return same response
  // Prevents email enumeration attacks
  return ok(res, null, "If that email exists, a reset link has been sent");
}

/**
 * Reset password using reset token
 */
export async function resetPassword(req, res) {
  // Verify token + update password
  await svc.consumeResetToken(req.body.token, req.body.password);

  // Send success response
  return ok(res, null, "Password updated");
}

export async function logout(req, res) {
  await svc.revokeRefresh(req.cookies.rt);
  res.clearCookie("rt", svc.cookieOpts());
  return ok(res, null, "logged out");
}
