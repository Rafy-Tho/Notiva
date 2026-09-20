import Notebook from "../../models/Notebook.js";
import { NotFoundError, ConflictError } from "../../common/errors/errors.js";

export async function list(userId) {
  const notebooks = await Notebook.find({ userId, deletedAt: null }).sort({
    name: 1,
  });
  return notebooks;
}

export async function create(name, color, userId) {
  const existing = await Notebook.findOne({ name, userId });

  if (existing) {
    throw new ConflictError("Notebook already exists");
  }

  const notebook = await Notebook.create({
    name,
    userId,
    color,
  });
  return notebook;
}

export async function update(id, name, color, userId) {
  const notebook = await Notebook.findOne({ _id: id, userId });

  if (!notebook) {
    throw new NotFoundError("Notebook not found");
  }

  notebook.name = name;
  notebook.color = color;
  await notebook.save();

  return notebook;
}

export async function remove(id, userId) {
  const notebook = await Notebook.findOne({ _id: id, userId });

  if (!notebook) {
    throw new NotFoundError("Notebook not found");
  }

  notebook.deletedAt = Date.now();
  await notebook.save();

  return notebook;
}
