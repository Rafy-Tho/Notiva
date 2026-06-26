import mongoose from "mongoose";
import Note from "../models/Note.js";
import { cleanHtml, wordCount, htmlToText } from "../utils/sanitize.js";

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

  const filter = { userId };

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { title: { $regex: escaped, $options: "i" } },
      { content: { $regex: escaped, $options: "i" } },
    ];
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
    Note.find(filter).sort(sortOption).skip(skip).limit(limitNum),
    Note.countDocuments(filter),
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
  const note = await Note.findOne({ _id: id, userId });
  if (!note) {
    const e = new Error("Note not found");
    e.status = 404;
    throw e;
  }
  return note;
}

export async function createNote(userId, data) {
  const content = cleanHtml(data.content || "");
  const note = await Note.create({
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
  const content = data.content ? cleanHtml(data.content) : undefined;
  const title = data.title ? data.title : undefined;
  const note = await getNote(userId, id);
  if (
    opts.expectedUpdateAt &&
    new Date(opts.expectedUpdateAt).getTime() !==
    new Date(note.updatedAt).getTime()
  ) {
    const e = new Error("Note has been updated since last read");
    e.status = 409;
    throw e;
  }

  Object.assign(note, { title: title ?? note.title, content: content ?? note.content, wordCount: content ? wordCount(content) : note.wordCount });
  await note.save();
  return note;
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
  await Note.deleteOne({ _id: id, userId });
}

export async function toggleField(userId, id, field) {
  const note = await Note.findOne({ _id: id, userId });
  if (!note) {
    const e = new Error("Note not found");
    e.status = 404;
    throw e;
  }
  note[field] = !note[field];
  await note.save();
  return note;
}

export async function trashNotes(userId) {
  return await Note.find({ userId, deletedAt: { $ne: null } });
}

export async function getNoteCounts(userId) {
  const baseFilter = { userId, deletedAt: null };

  const [all, favorites, archive, trash, notebookCounts, tagCounts] =
    await Promise.all([
      Note.countDocuments(baseFilter),
      Note.countDocuments({ ...baseFilter, isFavorite: true }),
      Note.countDocuments({ ...baseFilter, isArchived: true }),
      Note.countDocuments({ userId, deletedAt: { $ne: null } }),
      Note.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null, notebookId: { $ne: null } } },
        { $group: { _id: "$notebookId", count: { $sum: 1 } } },
        { $project: { _id: 0, id: "$_id", count: 1 } },
      ]),
      Note.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
        { $unwind: { path: "$tagIds", preserveNullAndEmptyArrays: false } },
        { $group: { _id: "$tagIds", count: { $sum: 1 } } },
        { $project: { _id: 0, id: "$_id", count: 1 } },
      ]),
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
