import prisma from "../../db/prisma.js";

const tagInclude = { tags: { select: { tagId: true } } };

export async function findMany(userId, where, { orderBy, skip, take }) {
  return prisma.note.findMany({
    where: { userId, ...where },
    orderBy,
    skip,
    take,
    include: tagInclude,
  });
}

export async function countMany(userId, where) {
  return prisma.note.count({ where: { userId, ...where } });
}

export async function findById(userId, id) {
  return prisma.note.findFirst({
    where: { id, userId },
    include: tagInclude,
  });
}

export async function createOne({
  userId,
  title,
  content,
  notebookId,
  tagIds,
  isPinned,
  isFavorite,
  isArchived,
  wordCount,
}) {
  return prisma.note.create({
    data: {
      userId,
      title,
      content,
      notebookId: notebookId ?? null,
      isPinned: isPinned ?? false,
      isFavorite: isFavorite ?? false,
      isArchived: isArchived ?? false,
      wordCount: wordCount ?? 0,
      tags: { create: (tagIds ?? []).map((tagId) => ({ tagId })) },
    },
    include: tagInclude,
  });
}

export async function updateById(userId, id, { data = {}, tagIds, expectedUpdatedAt } = {}) {
  return prisma.$transaction(async (tx) => {
    const where = { id, userId };
    if (expectedUpdatedAt) {
      where.updatedAt = new Date(expectedUpdatedAt);
    }

    const result = await tx.note.updateMany({ where, data });
    if (result.count === 0) return null;

    if (tagIds !== undefined) {
      await tx.noteTag.deleteMany({ where: { noteId: id } });
      if (tagIds.length > 0) {
        await tx.noteTag.createMany({
          data: tagIds.map((tagId) => ({ noteId: id, tagId })),
          skipDuplicates: true,
        });
      }
    }

    return tx.note.findFirst({ where: { id, userId }, include: tagInclude });
  });
}

export async function softDelete(userId, id) {
  const result = await prisma.note.updateMany({
    where: { id, userId },
    data: { deletedAt: new Date() },
  });
  if (result.count === 0) return null;
  return findById(userId, id);
}

export async function restore(userId, id) {
  const result = await prisma.note.updateMany({
    where: { id, userId },
    data: { deletedAt: null },
  });
  if (result.count === 0) return null;
  return findById(userId, id);
}

export async function deleteOne(userId, id) {
  const result = await prisma.note.deleteMany({ where: { id, userId } });
  return result.count;
}

export async function findTrash(userId) {
  return prisma.note.findMany({
    where: { userId, deletedAt: { not: null } },
    include: tagInclude,
  });
}

export async function aggregateNoteCounts(userId) {
  const rows = await prisma.note.groupBy({
    by: ["notebookId"],
    where: { userId, deletedAt: null },
    _count: { _all: true },
  });
  return rows.map((row) => ({ id: row.notebookId, count: row._count._all }));
}

export async function aggregateTagCounts(userId) {
  const rows = await prisma.$queryRaw`
    SELECT nt."tagId" AS id, COUNT(*)::int AS count
    FROM "NoteTag" nt
    JOIN "Note" n ON n."id" = nt."noteId"
    WHERE n."userId" = ${userId} AND n."deletedAt" IS NULL
    GROUP BY nt."tagId"
    LIMIT 100`;
  return rows;
}
