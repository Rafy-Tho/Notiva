import * as svc from "../services/auth.service.js";
import { me as getUser } from "../services/me.service.js";
import { sendResetEmail } from "../services/email.service.js";
import { ok } from "../utils/response.js";

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
  const user = await svc.login(req.body);
  const { accessToken } = svc.issueToken(user);
  setAuthCookie(res, accessToken);
  return ok(res, { user }, "logged in");
}

export async function forgotPassword(req, res) {
  const result = await svc.createResetToken(req.body.email);

  if (result) {
    const link = `${process.env.FRONTEND_ORIGIN.split(",")[0]
      }/reset-password?token=${result.token}`;

    await sendResetEmail(result.user.email, link);
  }

  return ok(res, null, "If that email exists, a reset link has been sent");
}

export async function resetPassword(req, res) {
  await svc.consumeResetToken(req.body.token, req.body.password);
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
