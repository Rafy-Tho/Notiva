import Tag from "../../models/Tag.js";

export async function list(userId) {
  return Tag.find({ userId, deletedAt: null });
}

export async function create(name, color, userId) {
  const existing = await Tag.findOne({ name, userId });

  if (existing) {
    const e = new Error("Tag already exists");
    e.status = 409;
    throw e;
  }

  return Tag.create({ name, color, userId });
}

export async function update(id, name, color) {
  const tag = await Tag.findByIdAndUpdate(
    id,
    { name, color },
    { new: true },
  );

  if (!tag) {
    const e = new Error("Tag not found");
    e.status = 404;
    throw e;
  }

  return tag;
}

export async function remove(id) {
  const tag = await Tag.findByIdAndUpdate(
    id,
    { deletedAt: Date.now() },
    { new: true },
  );

  if (!tag) {
    const e = new Error("Tag not found");
    e.status = 404;
    throw e;
  }

  return tag;
}
