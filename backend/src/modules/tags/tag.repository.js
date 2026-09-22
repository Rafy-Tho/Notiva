import prisma from "../../db/prisma.js";
import { ConflictError, NotFoundError } from "../../common/errors/errors.js";

export async function list(userId) {
  return prisma.tag.findMany({
    where: { userId, deletedAt: null },
  });
}

export async function create(name, color, userId) {
  const existing = await prisma.tag.findFirst({ where: { userId, name } });
  if (existing) {
    throw new ConflictError("Tag already exists");
  }
  return prisma.tag.create({ data: { name, color, userId } });
}

export async function update(id, name, color, userId) {
  const tag = await prisma.tag.findFirst({ where: { id, userId } });
  if (!tag) {
    throw new NotFoundError("Tag not found");
  }
  return prisma.tag.update({ where: { id }, data: { name, color } });
}

export async function remove(id, userId) {
  const tag = await prisma.tag.findFirst({ where: { id, userId } });
  if (!tag) {
    throw new NotFoundError("Tag not found");
  }
  return prisma.tag.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
