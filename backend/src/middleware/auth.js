import { verifyToken } from "../utils/tokens.js";

const COOKIE_NAME = "noteflow_token";

export function authRequired(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    const err = new Error("No token provided");
    err.status = 401;
    err.code = "NO_TOKEN";
    return next(err);
  }
  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch (err) {
    next(err);
  }
}
