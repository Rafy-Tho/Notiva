import prisma from "../../db/prisma.js";

export async function createToken({ userId, tokenHash, expiresAt }) {
  return prisma.emailVerificationToken.create({
    data: { userId, tokenHash, expiresAt },
  });
}

export async function findByTokenHash(tokenHash, now = new Date()) {
  return prisma.emailVerificationToken.findFirst({
    where: { tokenHash, expiresAt: { gt: now }, usedAt: null },
  });
}

export async function markAsUsed(id) {
  return prisma.emailVerificationToken.update({
    where: { id },
    data: { usedAt: new Date() },
  });
}

export async function deleteToken(id) {
  return prisma.emailVerificationToken.delete({ where: { id } });
}

export async function deleteByUserId(userId) {
  return prisma.emailVerificationToken.deleteMany({ where: { userId } });
}

export async function markEmailVerified(userId, emailVerifiedAt) {
  return prisma.user.update({
    where: { id: userId },
    data: { emailVerifiedAt },
  });
}
