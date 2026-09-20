import { verifyToken } from "../utils/tokens.js";
import { UnauthorizedError } from "../errors/errors.js";

const COOKIE_NAME = "noteflow_token";

export function authenticate(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return next(new UnauthorizedError("No token provided", "NO_TOKEN"));
  }
  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch (err) {
    next(err);
  }
}
