import Notebook from "../models/Notebook.js";

export const list = async (userId) => {
  const notebooks = await Notebook.find({ userId, deletedAt: null }).sort({
    name: 1,
  });
  return notebooks;
};

export const create = async (name, color, userId) => {
  const existing = await Notebook.findOne({ name, userId });

  if (existing) {
    const e = new Error("Notebook already exists");
    e.status = 409; // Conflict
    throw e;
  }

  const notebook = await Notebook.create({
    name: name,
    userId: userId,
    color: color,
  });
  return notebook;
};

export const update = async (id, name, color, userId) => {
  const existing = await Notebook.findOne({ name, userId });

  if (!existing) {
    const e = new Error("Notebook not found");
    e.status = 404; // Conflict
    throw e;
  }

  const notebook = await Notebook.findByIdAndUpdate(
    id,
    { name, color },
    { new: true },
  );

  return notebook;
};

export const remove = async (id) => {
  const notebook = await Notebook.findOneAndUpdate(id, {
    deletedAt: Date.now(),
  });

  if (!notebook) {
    const e = new Error("Notebook not found");
    e.status = 404;
    throw e;
  }

  return notebook;
};
