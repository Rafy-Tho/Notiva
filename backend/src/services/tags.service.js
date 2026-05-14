import { Tag } from "../models/Tag.js";

export const list = async (userId) => {
  const tags = await Tag.find({ userId, deletedAt: null }).sort({ name: 1 });
  return tags;
};

export const create = async (name, color, userId) => {
  const existing = await Tag.findOne({ name, userId });

  if (existing) {
    const e = new Error("Tag already exists");
    e.status = 409; // Conflict
    throw e;
  }

  const tag = await Tag.create({ name, userId, color });
  return tag;
};

export const update = async (id, name, color) => {
  const tag = await Tag.findByIdAndUpdate(id, { name, color }, { new: true });
  if (!tag) {
    const e = new Error("Tag not found");
    e.status = 404; // Conflict
    throw e;
  }
  return tag;
};

export const remove = async (id) => {
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
};
