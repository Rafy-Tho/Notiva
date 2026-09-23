import * as repo from "./note.repository.js";
import { cleanHtml, wordCount, htmlToText } from "../../common/utils/html.js";
import {
  NotFoundError,
} from "../../common/errors/NotFoundError.js";
import { ConflictError } from "../../common/errors/ConflictError.js";

export function toNoteResponse(note) {
  if (!note) return note;
  const { tags, ...rest } = note;
  return {
    ...rest,
    tagIds: tags ? tags.map((tag) => tag.tagId) : [],
  };
}

function buildFilter(query = {}) {
  const {
    search,
    dateFilter,
    from,
    to,
    notebookId,
    tagId,
    isArchived,
    isFavorite,
    isPinned,
    trashed,
  } = query;

  const filter = {};

  if (search) {
    filter.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  const now = new Date();
  const updatedAt = {};

  if (dateFilter === "today") {
    updatedAt.gte = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (dateFilter === "yesterday") {
    updatedAt.gte = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1,
    );
    updatedAt.lt = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (dateFilter === "last_7_days") {
    updatedAt.gte = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (dateFilter === "last_30_days") {
    updatedAt.gte = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (dateFilter === "last_90_days") {
    updatedAt.gte = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  } else if (dateFilter === "last_year") {
    updatedAt.gte = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  } else if (dateFilter === "custom") {
    if (from) updatedAt.gte = new Date(from);
    if (to) updatedAt.lte = new Date(`${to}T23:59:59`);
  }

  if (Object.keys(updatedAt).length > 0) filter.updatedAt = updatedAt;

  if (notebookId) filter.notebookId = notebookId;
  if (tagId) filter.tags = { some: { tagId } };
  if (isArchived === "true") filter.isArchived = true;
  if (isFavorite === "true") filter.isFavorite = true;
  if (isPinned === "true") filter.isPinned = true;
  if (trashed === "true") {
    filter.deletedAt = { not: null };
  } else {
    filter.deletedAt = null;
  }

  return filter;
}

export async function listNotes(userId, query = {}) {
  const { page = 1, limit = 20, sort, includeContent } = query;

  const filter = buildFilter(query);

  const orderBy =
    sort === "title"
      ? { title: "asc" }
      : [{ isPinned: "desc" }, { updatedAt: "desc" }];

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [notes, total] = await Promise.all([
    repo.findMany(userId, filter, { orderBy, skip, take: limitNum }),
    repo.countMany(userId, filter),
  ]);

  const notesWithPreview = notes.map((note) => {
    const n = toNoteResponse(note);
    const text = htmlToText(n.content);
    n.contentPreview = text.slice(0, 50);
    if (includeContent !== "true") delete n.content;
    return n;
  });

  return {
    notes: notesWithPreview,
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
    hasMore: pageNum * limitNum < total,
  };
}

export async function getNote(userId, id) {
  const note = await repo.findById(userId, id);
  if (!note) throw new NotFoundError();
  return toNoteResponse(note);
}

export async function createNote(userId, data) {
  const content = cleanHtml(data.content || "");
  const note = await repo.createOne({
    userId,
    title: data.title || "Untitled",
    content,
    notebookId: data.notebookId || null,
    tagIds: data.tagIds || [],
    isFavorite: data.isFavorite || false,
    wordCount: wordCount(content) || 0,
  });
  return toNoteResponse(note);
}

export async function updateNote(userId, id, data, opts = {}) {
  const updates = {};

  if (Object.hasOwn(data, "title")) updates.title = data.title;

  if (Object.hasOwn(data, "content")) {
    const content = cleanHtml(data.content || "");
    updates.content = content;
    updates.wordCount = wordCount(content);
  }

  for (const field of ["notebookId", "isPinned", "isArchived", "isFavorite"]) {
    if (Object.hasOwn(data, field)) updates[field] = data[field];
  }

  const tagIds = Object.hasOwn(data, "tagIds") ? data.tagIds || [] : undefined;

  if (Object.keys(updates).length === 0 && tagIds === undefined) {
    return getNote(userId, id);
  }

  const note = await repo.updateById(userId, id, {
    data: updates,
    tagIds,
    expectedUpdatedAt: opts.expectedUpdatedAt,
  });

  if (note) return toNoteResponse(note);

  const exists = await repo.findById(userId, id);
  if (!exists) throw new NotFoundError();

  if (opts.expectedUpdatedAt) {
    throw new ConflictError(
      "Note has been updated since last read",
      "NOTE_CONFLICT",
    );
  }

  throw new ConflictError("Note could not be updated");
}

export async function softDelete(userId, id) {
  const note = await getNote(userId, id);
  const deleted = await repo.softDelete(userId, note.id);
  return toNoteResponse(deleted);
}

export async function restore(userId, id) {
  const note = await getNote(userId, id);
  const restored = await repo.restore(userId, note.id);
  return toNoteResponse(restored);
}

export async function permanentDelete(userId, id) {
  return repo.deleteOne(userId, id);
}

export async function toggleField(userId, id, field) {
  const note = await getNote(userId, id);
  const updated = await repo.updateById(userId, id, {
    data: { [field]: !note[field] },
  });
  return toNoteResponse(updated);
}

export async function trashNotes(userId) {
  const notes = await repo.findTrash(userId);
  return notes.map(toNoteResponse);
}

export async function getNoteCounts(userId) {
  const baseFilter = { deletedAt: null };

  const [all, favorites, archive, trash, notebookCounts, tagCounts] =
    await Promise.all([
      repo.countMany(userId, baseFilter),
      repo.countMany(userId, { ...baseFilter, isFavorite: true }),
      repo.countMany(userId, { ...baseFilter, isArchived: true }),
      repo.countMany(userId, { deletedAt: { not: null } }),
      repo.aggregateNoteCounts(userId),
      repo.aggregateTagCounts(userId),
    ]);

  return {
    all,
    favorites,
    archive,
    trash,
    notebooks: notebookCounts,
    tags: tagCounts,
  };
}
