import * as svc from "./auth.service.js";
import { me as getUser } from "../users/user.service.js";
import { sendResetEmail } from "../email/email.service.js";
import { securityAudit } from "../../common/middleware/securityAudit.js";
import { ok } from "../../common/utils/response.js";

const COOKIE_NAME = "noteflow_token";
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

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export async function register(req, res) {
  const user = await svc.register(req.body);
  const { accessToken } = svc.issueToken(user);
  setAuthCookie(res, accessToken);
  return ok(res, { user }, "registered", 201);
}

export async function login(req, res) {
  const user = await svc.login(req.body, req);
  const { accessToken } = svc.issueToken(user);
  setAuthCookie(res, accessToken);
  return ok(res, { user }, "logged in");
}

export async function forgotPassword(req, res) {
  const result = await svc.createResetToken(req.body.email);

  if (result) {
    securityAudit.passwordResetRequested(result.user.email, req.ip);
    const link = `${process.env.FRONTEND_ORIGIN.split(",")[0]
      }/reset-password?token=${result.token}`;

    await sendResetEmail(result.user.email, link);
  }

  return ok(res, null, "If that email exists, a reset link has been sent");
}

export async function resetPassword(req, res) {
  await svc.consumeResetToken(req.body.token, req.body.password);
  securityAudit.passwordResetCompleted(req.body.email, req.ip);
  return ok(res, null, "Password updated");
}

export async function logout(req, res) {
  clearAuthCookie(res);
  return ok(res, null, "logged out");
}

export async function verify(req, res) {
  const user = await getUser(req.userId);
  return ok(res, { user }, "verified");
}
