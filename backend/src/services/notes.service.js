import Note from "../models/Note.js";
import NoteVersion from "../models/NoteVersion.js";
import { cleanHtml, wordCount } from "../utils/sanitize.js";

const PURGE_DAY = 30;

export async function listNotes(userId, query = {}) {
  const filter = {
    userId,
    deletedAt: null,
  };

  // Notebook filter
  if (query.notebookId) {
    filter.notebookId = query.notebookId;
  }

  // Tag filter
  if (query.tagId) {
    filter.tags = query.tagId;
  }

  // Favorite filter
  if (query.favorite === "true") {
    filter.isFavorite = true;
  }

  // Archive filter
  filter.isArchived = query.archived === "true";

  // Trash filter
  if (query.trashed === "true") {
    delete filter.isArchived;
    filter.deletedAt = { $ne: null };
  }

  // Search
  if (query.search) {
    const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.$or = [
      { title: { $regex: escaped, $options: "i" } },
      { content: { $regex: escaped, $options: "i" } },
    ];
  }

  // Sorting
  const sort =
    query.sort === "title" ? { title: 1 } : { isPinned: -1, updatedAt: -1 };

  return await Note.find(filter).sort(sort).lean();
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
    tags: data.tags || [],
    cover: data.cover || {},
    wordCound: wordCount(content) || 0,
  });
  return note;
}

export async function updateNote(userId, id, data, opts = {}) {
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
  if (data.content !== undefined) {
    await NoteVersion.create({
      noteId: note._id,
      userId,
      title: note.title,
      content: note.content,
    });
    data.content = cleanHtml(data.content);
    data.wordCount = wordCount(data.content);
  }
  Object.assign(note, data);
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
  await NoteVersion.deleteMany({ noteId: id, userId });
}

export async function listversions(userId, id) {
  const note = await getNote(userId, id);
  if (note.deletedAt) {
    const e = new Error("Note not found");
    e.status = 404;
    throw e;
  }
  return await NoteVersion.find({ noteId: id, userId }).sort({ saveAt: -1 });
}
