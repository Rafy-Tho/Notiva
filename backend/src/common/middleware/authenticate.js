import { validateSession, updateSessionLastUsed } from "../../modules/auth/session.service.js";
import { UnauthorizedError } from "../errors/errors.js";

const COOKIE_NAME = "noteflow_session";

export async function authenticate(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return next(new UnauthorizedError("No token provided", "NO_TOKEN"));
  }
  try {
    const session = await validateSession(token);
    if (!session) {
      return next(new UnauthorizedError("Invalid session", "INVALID_SESSION"));
    }
    if (session.revokedAt) {
      return next(new UnauthorizedError("Session revoked", "SESSION_REVOKED"));
    }
    if (session.expiresAt < new Date()) {
      return next(new UnauthorizedError("Session expired", "SESSION_EXPIRED"));
    }
    await updateSessionLastUsed(session.id);
    req.userId = session.userId;
    req.sessionId = session.id;
    next();
  } catch (err) {
    next(err);
  }
}
