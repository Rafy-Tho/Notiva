import * as svc from "../services/auth.service.js";
import { ok } from "../utils/response.js";

const meta = (req) => ({ userAget: req.headers["user-agent"], ip: req.ip });

export async function register(req, res) {
  const user = await svc.register(req.body);
  const tokens = await svc.issueTokens(user, meta(req));
  res.cookie("rt", tokens.refreshToken, svc.cookieOpts());
  return ok(res, { user, accessToken: tokens.accessToken }, "registered", 201);
}

export async function login(req, res) {
  const user = await svc.login(req.body);
  const tokens = await svc.issueTokens(user, meta(req));
  res.cookie("rt", tokens.refreshToken, svc.cookieOpts());
  return ok(res, { user, accessToken: tokens.accessToken }, "logged in");
}
