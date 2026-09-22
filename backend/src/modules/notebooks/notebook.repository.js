import prisma from "../../db/prisma.js";
import { ConflictError, NotFoundError } from "../../common/errors/errors.js";

export async function list(userId) {
  return prisma.notebook.findMany({
    where: { userId, deletedAt: null },
    orderBy: { name: "asc" },
  });
}

export async function create(name, color, userId) {
  const existing = await prisma.notebook.findFirst({ where: { userId, name } });
  if (existing) {
    throw new ConflictError("Notebook already exists");
  }
  return prisma.notebook.create({ data: { name, color, userId } });
}

export async function update(id, name, color, userId) {
  const notebook = await prisma.notebook.findFirst({ where: { id, userId } });
  if (!notebook) {
    throw new NotFoundError("Notebook not found");
  }
  return prisma.notebook.update({ where: { id }, data: { name, color } });
}

export async function remove(id, userId) {
  const notebook = await prisma.notebook.findFirst({ where: { id, userId } });
  if (!notebook) {
    throw new NotFoundError("Notebook not found");
  }
  return prisma.notebook.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
