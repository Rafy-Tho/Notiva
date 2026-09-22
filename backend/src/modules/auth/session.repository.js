import prisma from "../../db/prisma.js";

export async function createSession({ userId, tokenHash, deviceName, ipAddress, userAgent, expiresAt }) {
  return prisma.userSession.create({
    data: {
      userId,
      tokenHash,
      deviceName,
      ipAddress,
      userAgent,
      expiresAt,
    },
  });
}

export async function findByTokenHash(tokenHash) {
  return prisma.userSession.findUnique({
    where: { tokenHash },
  });
}

export async function updateLastUsed(id) {
  return prisma.userSession.update({
    where: { id },
    data: { lastUsedAt: new Date() },
  });
}

export async function revoke(id) {
  return prisma.userSession.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
}

export async function revokeByUserId(userId) {
  return prisma.userSession.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function deleteExpired() {
  return prisma.userSession.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { revokedAt: { not: null } },
      ],
    },
  });
}
