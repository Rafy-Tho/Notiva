import prisma from "../../db/prisma.js";

export async function findByProvider(provider, providerUserId) {
  return prisma.authAccount.findUnique({
    where: {
      provider_providerUserId: {
        provider,
        providerUserId,
      },
    },
  });
}

export async function findById(id) {
  return prisma.authAccount.findUnique({ where: { id } });
}

export async function create({ userId, provider, providerUserId }) {
  return prisma.authAccount.create({
    data: { userId, provider, providerUserId },
  });
}