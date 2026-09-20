import * as repo from "./user.repository.js";
import bcrypt from "bcrypt";
import { NotFoundError, UnauthorizedError } from "../../common/errors/errors.js";

export const me = async (id) => {
  const user = await repo.findById(id);
  if (!user) {
    throw new NotFoundError();
  }
  return user;
};

export const update = async (id, name) => {
  const user = await repo.update(id, { name });
  if (!user) {
    throw new NotFoundError();
  }
  return user;
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
  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
  return user;
};

export async function deleteAccount(id) {
  await repo.update(id, { deletedAt: new Date() });
}

export async function updateAvatar(id, url) {
  const user = await repo.update(id, { avatar: url });
  if (!user) {
    throw new NotFoundError();
  }
  return user;
}
