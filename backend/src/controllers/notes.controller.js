import * as svc from "../services/notes.service.js";
import { ok } from "../utils/response.js";

export const list = async (req, res) => {
  const notes = await svc.listNotes(req.userId, req.query);
  return ok(res, notes, "List notes");
};

export const get = async (req, res) => {
  const note = await svc.getNote(req.userId, req.params.id);
  return ok(res, note, "Get note");
};

export const create = async (req, res) => {
  const note = await svc.createNote(req.userId, req.body);
  return ok(res, note, "Create note");
};

export const update = async (req, res) => {
  const note = await svc.updateNote(req.userId, req.params.id, req.body, {
    expectedUpdateAt: req.body.updatedAt,
  });
  return ok(res, note, "Update note");
};

export const remove = async (req, res) => {
  const note = await svc.softDelete(req.userId, req.params.id);
  return ok(res, note, "Remove note");
};

export const restore = async (req, res) => {
  const note = await svc.restore(req.userId, req.params.id);
  return ok(res, note, "Restore note");
};

export const purge = async (req, res) => {
  const note = await svc.permanentDelete(req.userId, req.params.id);
  return ok(res, note, "Purge note");
};

export const togglePin = async (req, res) => {
  const note = await svc.toggleField(req.userId, req.params.id, "isPinned");
  return ok(res, note, "Toggle pin note");
};

export const toggleArchive = async (req, res) => {
  const note = await svc.toggleField(req.userId, req.params.id, "isArchived");
  return ok(res, note, "Toggle archive note");
};

export const toggleFavorite = async (req, res) => {
  const note = await svc.toggleField(req.userId, req.params.id, "isFavorite");
  return ok(res, note, "Toggle favorite note");
};

export const getTrashNotes = async (req, res) => {
  const notes = await svc.trashNotes(req.userId);
  return ok(res, notes, "Get trash notes");
};
