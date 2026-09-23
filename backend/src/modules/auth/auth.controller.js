import * as authSvc from "./auth.service.js";
import * as sessionSvc from "./session.service.js";
import { me as getUser } from "../users/user.service.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../email/email.service.js";
import { ok } from "../../common/utils/response.js";

const COOKIE_NAME = "noteflow_session";
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
}

export { setAuthCookie };

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export async function register(req, res) {
  const { user } = await authSvc.register(req.body);
  const { code } = await authSvc.sendVerificationCode(req.body.email);
  try {
    await sendVerificationEmail(req.body.email, code);
  } catch (err) {
    console.error("Verification email failed:", err.message);
  }
  return ok(res, { user }, "Verification code sent", 201);
}

export async function login(req, res) {
  const { user, session } = await authSvc.login(req.body, req);
  setAuthCookie(res, session.rawToken);
  return ok(res, { user }, "logged in");
}

export async function logout(req, res) {
  if (req.userId) {
    await sessionSvc.revokeAllSessions(req.userId);
  }
  clearAuthCookie(res);
  return ok(res, null, "logged out");
}

export async function verify(req, res) {
  const user = await getUser(req.userId);
  return ok(res, { user }, "verified");
}

export async function resendVerification(req, res) {
  const { code } = await authSvc.sendVerificationCode(req.body.email);
  await sendVerificationEmail(req.body.email, code);
  return ok(res, null, "Verification code sent");
}

export async function verifyEmail(req, res) {
  const { user, session } = await authSvc.verifyCode(req.body.email, req.body.code, req);
  setAuthCookie(res, session.rawToken);
  return ok(res, { user }, "Email verified");
}

export async function resetPasswordCode(req, res) {
  const result = await authSvc.sendPasswordResetCode(req.body.email);
  if (result.sent) {
    try {
      await sendPasswordResetEmail(req.body.email, result.code);
    } catch (err) {
      console.error("Password reset email failed:", err.message);
    }
  }
  return ok(res, null, "If the account exists, a reset code has been sent");
}

export async function confirmPasswordReset(req, res) {
  const { user } = await authSvc.resetPasswordWithCode(req.body.email, req.body.code, req.body.password);
  return ok(res, { user }, "Password reset");
}
