import * as repo from "./user.repository.js";
import bcrypt from "bcrypt";
import { NotFoundError, UnauthorizedError } from "../../common/errors/errors.js";

export function toPublicUser(user) {
  if (!user) return user;
  const { id, name, email, avatar, deletedAt, createdAt, updatedAt } = user;
  return { id, name, email, avatar, deletedAt, createdAt, updatedAt };
}

export const me = async (id) => {
  const user = await repo.findById(id);
  if (!user) {
    throw new NotFoundError();
  }
  return toPublicUser(user);
};

export const update = async (id, name) => {
  const user = await repo.update(id, { name });
  return toPublicUser(user);
};

export const changePassword = async (id, { oldPassword, newPassword }) => {
  const user = await repo.findById(id);
  if (!user) {
    throw new NotFoundError();
  }
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    throw new UnauthorizedError("Invalid credentials");
  }
  const hashed = await bcrypt.hash(newPassword, 12);
  const updated = await repo.setPassword(id, hashed);
  return toPublicUser(updated);
};

export async function deleteAccount(id) {
  await repo.update(id, { deletedAt: new Date() });
}

export async function updateAvatar(id, url) {
  const user = await repo.update(id, { avatar: url });
  return toPublicUser(user);
}
