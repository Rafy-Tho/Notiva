import Note from "../models/Note.js";
import { cleanHtml, wordCount } from "../utils/sanitize.js";

export async function listNotes(userId, query = {}) {
  const sort =
    query.sort === "title" ? { title: 1 } : { isPinned: -1, updatedAt: -1 };

  return await Note.find({ userId }).sort(sort);
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
}

export async function trashNotes(userId) {
  await Note.find({ userId, deletedAt: { $ne: null } });
}
