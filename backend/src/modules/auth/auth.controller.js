import * as authSvc from "./auth.service.js";
import * as sessionSvc from "./session.service.js";
import { UAParser } from "ua-parser-js";
import { me as getUser } from "../users/user.service.js";
import { sendResetEmail } from "../email/email.service.js";
import { securityAudit } from "../../common/middleware/securityAudit.js";
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

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export async function register(req, res) {
  const user = await authSvc.register(req.body);
  const ua = new UAParser(req.headers["user-agent"]);
  const device = ua.getDevice();
  const session = await sessionSvc.createSession({
    userId: user.id,
    deviceName: device.model || req.headers["sec-ch-ua-model"] || "Unknown Device",
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
  setAuthCookie(res, session.rawToken);
  return ok(res, { user }, "registered", 201);
}

export async function login(req, res) {
  const { user, session } = await authSvc.login(req.body, req);
  setAuthCookie(res, session.rawToken);
  return ok(res, { user }, "logged in");
}

export async function forgotPassword(req, res) {
  const canProceed = await authSvc.checkResetRate(req.body.email);

  if (!canProceed) {
    securityAudit.passwordResetRequested(req.body.email, req.ip);
    return ok(res, null, "If that email exists, a reset link has been sent");
  }

  const result = await authSvc.createResetToken(req.body.email);

  if (result) {
    securityAudit.passwordResetRequested(result.user.email, req.ip);
    const link = `${process.env.FRONTEND_ORIGIN.split(",")[0]
      }/reset-password?token=${result.token}`;

    await sendResetEmail(result.user.email, link);
  }

  return ok(res, null, "If that email exists, a reset link has been sent");
}

export async function resetPassword(req, res) {
  await authSvc.consumeResetToken(req.body.token, req.body.password);
  securityAudit.passwordResetCompleted(req.body.email, req.ip);
  return ok(res, null, "Password updated");
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
