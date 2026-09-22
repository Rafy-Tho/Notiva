import prisma from "../../db/prisma.js";

export async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

export async function create({ name, email, password }) {
  return prisma.user.create({ data: { name, email, password } });
}

export async function findById(id) {
  return prisma.user.findUnique({ where: { id } });
}

export async function update(id, updates) {
  return prisma.user.update({ where: { id }, data: updates });
}

export async function setPassword(id, password) {
  return prisma.user.update({ where: { id }, data: { password } });
}

export async function setResetToken(id, { resetToken, resetTokenExpires }) {
  return prisma.user.update({
    where: { id },
    data: { resetToken, resetTokenExpires },
  });
}

export async function clearResetToken(id) {
  return prisma.user.update({
    where: { id },
    data: { resetToken: null, resetTokenExpires: null },
  });
}

export async function findByResetToken(resetToken, now = new Date()) {
  return prisma.user.findFirst({
    where: { resetToken, resetTokenExpires: { gt: now } },
  });
}
