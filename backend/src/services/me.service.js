import { User } from "../models/User.js";
import bcrypt from "bcrypt";
export const me = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const e = new Error("User not found");
    e.status = 404;
    throw e;
  }
  return user;
};

export const update = async (id, name) => {
  const user = await User.findByIdAndUpdate(id, { name }, { new: true });
  if (!user) {
    const e = new Error("User not found");
    e.status = 404;
    throw e;
  }
  return user;
};

export const changePassword = async (id, { oldPassword, newPassword }) => {
  const user = await User.findById(id);
  if (!user) {
    const e = new Error("User not found");
    e.status = 404;
    throw e;
  }
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    const e = new Error("Invalid credentials");
    e.status = 401;
    throw e;
  }
  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
  return user;
};

export async function deleteAccount(id) {
  await User.findByIdAndUpdate(id, { deletedAt: new Date() });
}

export async function updateAvatar(id, url) {
  const user = await User.findByIdAndUpdate(id, { avatar: url }, { new: true });
  if (!user) {
    const e = new Error("User not found");
    e.status = 404;
    throw e;
  }
  return user;
}
