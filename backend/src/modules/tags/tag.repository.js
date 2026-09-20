import Tag from "../../models/Tag.js";
import { NotFoundError, ConflictError } from "../../common/errors/errors.js";

export async function list(userId) {
  return Tag.find({ userId, deletedAt: null });
}

export async function create(name, color, userId) {
  const existing = await Tag.findOne({ name, userId });

  if (existing) {
    throw new ConflictError("Tag already exists");
  }

  return Tag.create({ name, color, userId });
}

export async function update(id, name, color, userId) {
  const tag = await Tag.findByIdAndUpdate(
    { _id: id, userId },
    { name, color },
    { new: true },
  );

  if (!tag) {
    throw new NotFoundError("Tag not found");
  }

  return tag;
}

export async function remove(id, userId) {
  const tag = await Tag.findByIdAndUpdate(
    { _id: id, userId },
    { deletedAt: Date.now() },
    { new: true },
  );

  if (!tag) {
    throw new NotFoundError("Tag not found");
  }

  return tag;
}
