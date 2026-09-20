import Notebook from "../../models/Notebook.js";

export async function list(userId) {
  const notebooks = await Notebook.find({ userId, deletedAt: null }).sort({
    name: 1,
  });
  return notebooks;
}

export async function create(name, color, userId) {
  const existing = await Notebook.findOne({ name, userId });

  if (existing) {
    const e = new Error("Notebook already exists");
    e.status = 409;
    throw e;
  }

  const notebook = await Notebook.create({
    name,
    userId,
    color,
  });
  return notebook;
}

export async function update(id, name, color, userId) {
  const notebook = await Notebook.findByIdAndUpdate(
    { _id: id, userId },
    { name, color },
    { new: true },
  );
  if (!notebook) {
    const e = new Error("Notebook not found");
    e.status = 404;
    throw e;
  }
  return notebook;
}

export async function remove(id, userId) {
  const notebook = await Notebook.findByIdAndUpdate(
    { _id: id, userId },
    {
      deletedAt: Date.now(),
    },
    { new: true },
  );

  if (!notebook) {
    const e = new Error("Notebook not found");
    e.status = 404;
    throw e;
  }

  return notebook;
}
