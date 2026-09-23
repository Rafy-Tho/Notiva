import prisma from "../../db/prisma.js";

export async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

export async function create({ name, email, password, emailVerifiedAt, avatar }) {
  return prisma.user.create({ data: { name, email, password, emailVerifiedAt, avatar } });
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
