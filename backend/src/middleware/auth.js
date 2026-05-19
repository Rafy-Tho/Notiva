import { verifyAccess } from "../utils/tokens.js";

export function authRequired(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h?.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) {
    const err = new Error("No token provided");
    err.status = 401;
    err.code = "NO_TOKEN";
    return next(err);
  }
  try {
    const payload = verifyAccess(token);
    req.userId = payload.sub;
    next();
  } catch (err) {
    next(err);
  }
}
