import crypto from "node:crypto";
import * as oauthSvc from "./oauth.service.js";
import { setAuthCookie } from "./auth.controller.js";
import { logger } from "../../common/utils/logger.js";

const STATE_COOKIE = "oauth_state";
const STATE_TTL_MS = 10 * 60 * 1000;
const STATE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: STATE_TTL_MS,
  path: "/",
};

function getFrontendOrigin() {
  const raw = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
  return raw.split(",")[0].trim();
}

function redirectToLogin(res, errorKey) {
  const url = new URL("/login", getFrontendOrigin());
  url.searchParams.set("oauth_error", errorKey);
  return res.redirect(url.toString());
}

export function googleLogin(req, res) {
  if (!oauthSvc.isGoogleConfigured()) {
    return redirectToLogin(res, "google_not_configured");
  }
  const state = crypto.randomBytes(32).toString("hex");
  res.cookie(STATE_COOKIE, state, STATE_OPTS);
  return res.redirect(oauthSvc.buildAuthUrl(state));
}

export async function googleCallback(req, res) {
  const { state, code, error } = req.query;
  const storedState = req.cookies?.[STATE_COOKIE];

  res.clearCookie(STATE_COOKIE, { path: "/" });

  if (!storedState || !state || state !== storedState) {
    return redirectToLogin(res, "invalid_state");
  }

  if (error) {
    return redirectToLogin(res, "cancelled");
  }

  if (!code) {
    return redirectToLogin(res, "invalid_callback");
  }

  try {
    const { session } = await oauthSvc.handleGoogleCallback({
      code,
      redirectUri: process.env.GOOGLE_CALLBACK_URL,
      req,
    });
    setAuthCookie(res, session.rawToken);
    return res.redirect(getFrontendOrigin());
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      logger.error("Google OAuth callback failed:", err.message);
    }
    return redirectToLogin(res, "google_failed");
  }
}