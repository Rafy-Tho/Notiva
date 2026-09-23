import crypto from "node:crypto";
import bcrypt from "bcrypt";
import * as userRepo from "../users/user.repository.js";
import { toPublicUser } from "../users/user.service.js";
import * as oauthRepo from "./oauth.repository.js";
import { createSession } from "./session.service.js";
import { buildSessionContext } from "./auth.service.js";
import { BadRequestError, UnauthorizedError } from "../../common/errors/errors.js";
import { securityAudit } from "../../common/middleware/securityAudit.js";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const CERTS_TTL_MS = 60 * 60 * 1000;
const PROVIDER = "google";

let certsCache = { keys: [], fetchedAt: 0 };

function base64UrlToBuffer(str) {
  const padded = str
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(str.length / 4) * 4, "=");
  return Buffer.from(padded, "base64");
}

export function buildAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

async function getGoogleKeys() {
  if (
    certsCache.keys.length > 0 &&
    Date.now() - certsCache.fetchedAt < CERTS_TTL_MS
  ) {
    return certsCache.keys;
  }
  const res = await fetch(GOOGLE_CERTS_URL);
  if (!res.ok) {
    throw new BadRequestError("Unable to fetch Google signing keys", "GOOGLE_UNAVAILABLE");
  }
  const data = await res.json();
  certsCache = { keys: data.keys || [], fetchedAt: Date.now() };
  return certsCache.keys;
}

function verifyJwtSignature(token, key) {
  const [header, payload, signature] = token.split(".");
  const data = Buffer.from(`${header}.${payload}`, "ascii");
  const publicKey = crypto.createPublicKey({
    key: { kty: key.kty, n: key.n, e: key.e },
    format: "jwk",
  });
  return crypto.verify("RSA-SHA256", data, publicKey, base64UrlToBuffer(signature));
}

export async function verifyIdToken(idToken) {
  const parts = idToken.split(".");
  if (parts.length !== 3) {
    throw new BadRequestError("Invalid Google token", "INVALID_GOOGLE_TOKEN");
  }
  const header = JSON.parse(Buffer.from(base64UrlToBuffer(parts[0]), "utf8"));
  const payload = JSON.parse(Buffer.from(base64UrlToBuffer(parts[1]), "utf8"));

  const keys = await getGoogleKeys();
  const key = keys.find((k) => k.kid === header.kid && k.alg === "RS256");
  if (!key || !verifyJwtSignature(idToken, key)) {
    throw new BadRequestError("Invalid Google token", "INVALID_GOOGLE_TOKEN");
  }

  const now = Math.floor(Date.now() / 1000);
  const validIss = ["https://accounts.google.com", "accounts.google.com"].includes(
    payload.iss,
  );
  if (
    !validIss ||
    payload.aud !== process.env.GOOGLE_CLIENT_ID ||
    payload.exp <= now
  ) {
    throw new BadRequestError("Invalid Google token", "INVALID_GOOGLE_TOKEN");
  }

  if (payload.email_verified !== true) {
    throw new BadRequestError("Google email not verified", "GOOGLE_EMAIL_NOT_VERIFIED");
  }

  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  };
}

export async function exchangeCode(code, redirectUri) {
  const params = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) {
    throw new BadRequestError("Google token exchange failed", "GOOGLE_TOKEN_FAILED");
  }
  const data = await res.json();
  if (!data.id_token) {
    throw new BadRequestError("Google token exchange failed", "GOOGLE_TOKEN_FAILED");
  }
  return data;
}

export function isGoogleConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_CALLBACK_URL,
  );
}

function rejectIfDeleted(user) {
  if (!user) {
    throw new UnauthorizedError("Account not found", "GOOGLE_ACCOUNT_NOT_FOUND");
  }
  if (user.deletedAt) {
    throw new UnauthorizedError("Account is deleted", "ACCOUNT_DELETED");
  }
}

async function ensureVerified(user) {
  if (!user.emailVerifiedAt) {
    return userRepo.update(user.id, { emailVerifiedAt: new Date() });
  }
  return user;
}

async function loginWithAccount(account, req) {
  let user = await userRepo.findById(account.userId);
  rejectIfDeleted(user);
  user = await ensureVerified(user);
  const session = await createSession({
    userId: user.id,
    ...buildSessionContext(req),
  });
  return { user: toPublicUser(user), session };
}

async function recoverFromRace(err, profile, req) {
  if (err?.code !== "P2002") throw err;
  const account = await oauthRepo.findByProvider(PROVIDER, profile.sub);
  if (account) {
    return loginWithAccount(account, req);
  }
  return null;
}

export async function handleGoogleCallback({ code, redirectUri, req }) {
  const tokens = await exchangeCode(code, redirectUri);
  const profile = await verifyIdToken(tokens.id_token);
  const normalizedEmail = profile.email.toLowerCase();

  const existingAccount = await oauthRepo.findByProvider(PROVIDER, profile.sub);
  if (existingAccount) {
    const result = await loginWithAccount(existingAccount, req);
    if (req) securityAudit.successfulLogin(normalizedEmail, req.ip);
    return result;
  }

  let user = await userRepo.findByEmail(normalizedEmail);
  if (user) {
    rejectIfDeleted(user);
    user = await ensureVerified(user);
    if (!user.avatar && profile.picture) {
      user = await userRepo.update(user.id, { avatar: profile.picture });
    }
  } else {
    const randomPassword = crypto.randomBytes(32).toString("hex");
    const passwordHash = await bcrypt.hash(randomPassword, 12);
    try {
      user = await userRepo.create({
        name: profile.name || normalizedEmail.split("@")[0] || "Google User",
        email: normalizedEmail,
        password: passwordHash,
        emailVerifiedAt: new Date(),
        avatar: profile.picture || null,
      });
    } catch (err) {
      const recovered = await recoverFromRace(err, profile, req);
      if (recovered) return recovered;
      user = await userRepo.findByEmail(normalizedEmail);
      rejectIfDeleted(user);
    }
  }

  try {
    await oauthRepo.create({
      userId: user.id,
      provider: PROVIDER,
      providerUserId: profile.sub,
    });
  } catch (err) {
    const recovered = await recoverFromRace(err, profile, req);
    if (recovered) return recovered;
    throw err;
  }

  const session = await createSession({
    userId: user.id,
    ...buildSessionContext(req),
  });
  if (req) securityAudit.successfulLogin(normalizedEmail, req.ip);
  return { user: toPublicUser(user), session };
}