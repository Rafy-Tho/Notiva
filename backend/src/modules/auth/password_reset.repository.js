import prisma from "../../db/prisma.js";

export async function createToken({ userId, tokenHash, expiresAt }) {
  return prisma.passwordResetToken.create({
    data: { userId, tokenHash, expiresAt },
  });
}

export async function findByUserIdAndTokenHash(userId, tokenHash, now = new Date()) {
  return prisma.passwordResetToken.findFirst({
    where: { userId, tokenHash, expiresAt: { gt: now }, usedAt: null },
  });
}

export async function markAsUsed(id) {
  return prisma.passwordResetToken.update({
    where: { id },
    data: { usedAt: new Date() },
  });
}

export async function deleteToken(id) {
  return prisma.passwordResetToken.delete({ where: { id } });
}

export async function deleteByUserId(userId) {
  return prisma.passwordResetToken.deleteMany({ where: { userId } });
}
