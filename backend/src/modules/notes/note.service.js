import * as repo from "./note.repository.js";
import { cleanHtml, wordCount, htmlToText } from "../../common/utils/html.js";

export async function listNotes(userId, query = {}) {
  const {
    search,
    dateFilter,
    from,
    to,
    page = 1,
    limit = 20,
    sort,
    notebookId,
    tagId,
    isArchived,
    isFavorite,
    isPinned,
    trashed,
    includeContent,
  } = query;

  const filter = {};

  if (search) {
    filter.$text = { $search: search };
  }

  const now = new Date();
  if (dateFilter === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    filter.updatedAt = { $gte: start };
  } else if (dateFilter === "yesterday") {
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1,
    );
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    filter.updatedAt = { $gte: start, $lt: end };
  } else if (dateFilter === "last_7_days") {
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    filter.updatedAt = { $gte: start };
  } else if (dateFilter === "last_30_days") {
    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    filter.updatedAt = { $gte: start };
  } else if (dateFilter === "last_90_days") {
    const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    filter.updatedAt = { $gte: start };
  } else if (dateFilter === "last_year") {
    const start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    filter.updatedAt = { $gte: start };
  } else if (dateFilter === "custom") {
    if (from || to) {
      filter.updatedAt = {};
      if (from) filter.updatedAt.$gte = new Date(from);
      if (to) filter.updatedAt.$lte = new Date(to + "T23:59:59");
    }
  }

  if (notebookId) filter.notebookId = notebookId;
  if (tagId) filter.tagIds = tagId;
  if (isArchived === "true") filter.isArchived = true;
  if (isFavorite === "true") filter.isFavorite = true;
  if (isPinned === "true") filter.isPinned = true;
  if (trashed === "true") {
    filter.deletedAt = { $ne: null };
  } else {
    filter.deletedAt = null;
  }

  const sortOption =
    sort === "title" ? { title: 1 } : { isPinned: -1, updatedAt: -1 };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [notes, total] = await Promise.all([
    repo.findMany(userId, filter, { sort: sortOption, skip, limit: limitNum }),
    repo.countMany(userId, filter),
  ]);

  const notesWithPreview = notes.map((note) => {
    const n = note.toJSON();
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
  if (!note) {
    const e = new Error("Note not found");
    e.status = 404;
    throw e;
  }
  return note;
}

export async function createNote(userId, data) {
  const content = cleanHtml(data.content || "");
  const note = await repo.createOne({
    userId,
    title: data.title || "Untitled",
    content,
    notebookId: data.notebookId || null,
    tagIds: data.tagIds || [],
    cover: data.cover || {},
    isFavorite: data.isFavorite || false,
    wordCount: wordCount(content) || 0,
  });
  return note;
}

export async function updateNote(userId, id, data, opts = {}) {
  const updates = {};

  if (Object.hasOwn(data, "title")) updates.title = data.title;

  if (Object.hasOwn(data, "content")) {
    const content = cleanHtml(data.content || "");
    updates.content = content;
    updates.wordCount = wordCount(content);
  }

  for (const field of [
    "notebookId",
    "tagIds",
    "cover",
    "isPinned",
    "isArchived",
    "isFavorite",
  ]) {
    if (Object.hasOwn(data, field)) updates[field] = data[field];
  }

  if (Object.keys(updates).length === 0) return getNote(userId, id);

  const filter = { _id: id, userId };
  if (opts.expectedUpdatedAt) {
    filter.updatedAt = new Date(opts.expectedUpdatedAt);
  }

  const note = await repo.findByIdAndUpdate(id, updates);

  if (note) return note;

  const exists = await repo.findById(userId, id);
  if (!exists) {
    const e = new Error("Note not found");
    e.status = 404;
    throw e;
  }

  if (opts.expectedUpdatedAt) {
    const e = new Error("Note has been updated since last read");
    e.status = 409;
    e.code = "NOTE_CONFLICT";
    throw e;
  }

  const e = new Error("Note could not be updated");
  e.status = 409;
  throw e;
}

export async function softDelete(userId, id) {
  const note = await getNote(userId, id);
  note.deletedAt = new Date();
  await note.save();
  return note;
}

export async function restore(userId, id) {
  const note = await getNote(userId, id);
  note.deletedAt = null;
  await note.save();
  return note;
}

export async function permanentDelete(userId, id) {
  await repo.deleteOne(userId, id);
}

export async function toggleField(userId, id, field) {
  const note = await getNote(userId, id);
  note[field] = !note[field];
  await note.save();
  return note;
}

export async function trashNotes(userId) {
  return await repo.findTrash(userId);
}

export async function getNoteCounts(userId) {
  const baseFilter = { deletedAt: null };

  const [all, favorites, archive, trash, notebookCounts, tagCounts] =
    await Promise.all([
      repo.countMany(userId, baseFilter),
      repo.countMany(userId, { ...baseFilter, isFavorite: true }),
      repo.countMany(userId, { ...baseFilter, isArchived: true }),
      repo.countMany(userId, { deletedAt: { $ne: null } }),
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
