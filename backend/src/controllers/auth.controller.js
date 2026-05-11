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

export async function refresh(req, res) {
  const token = req.cookies?.rt;
  const tokens = await svc.rotateRefresh(token, meta(req));
  res.cookie("rt", tokens.refreshToken, svc.cookieOpts());
  return ok(res, { accessToken: tokens.accessToken });
}
