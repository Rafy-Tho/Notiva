import crypto from "node:crypto";
import { hashToken } from "../../common/utils/tokens.js";
import * as sessionRepo from "./session.repository.js";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function generateSecureToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashSessionToken(token) {
  return hashToken(token);
}

export async function createSession({ userId, deviceName, ipAddress, userAgent }) {
  const rawToken = generateSecureToken();
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  const session = await sessionRepo.createSession({
    userId,
    tokenHash,
    deviceName,
    ipAddress,
    userAgent,
    expiresAt,
  });

  return { session, rawToken };
}

export async function validateSession(token) {
  const tokenHash = hashSessionToken(token);
  const session = await sessionRepo.findByTokenHash(tokenHash);
  return session;
}

export async function updateSessionLastUsed(id) {
  return sessionRepo.updateLastUsed(id);
}

export async function revokeSession(id) {
  return sessionRepo.revoke(id);
}

export async function revokeAllSessions(userId) {
  return sessionRepo.revokeByUserId(userId);
}

export function getExpiresAt(days = 7) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
