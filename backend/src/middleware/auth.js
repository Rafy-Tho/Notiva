import { fail } from "../utils/response";
import { verifyAccess } from "../utils/tokens.js";

export function authRequired(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startWith("Bearer ") ? h.slice(7) : null;
  if (!token) return fail(res, "Unauthorized", 401);
  try {
    const payload = verifyAccess(token);
    req.userId = payload.sub;
    next();
  } catch {
    return fail(res, "Invalid token", 401);
  }
}
