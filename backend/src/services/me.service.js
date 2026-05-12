import mongoose from "mongoose";
import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import { RefreshToken } from "../models/RefreshToken.js";
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

export const changePassword = async (id, password) => {
  const user = await User.findById(id);
  if (!user) {
    const e = new Error("User not found");
    e.status = 404;
    throw e;
  }
  const ok = await user.compare(password, user.password);
  if (!ok) {
    const e = new Error("Invalid credentials");
    e.status = 401;
    throw e;
  }
  user.password = await bcrypt.hash(password, 12);
  await user.save();
  return user;
};

export async function deleteAccount(id) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const now = new Date();

    await User.findByIdAndUpdate(id, { deletedAt: now }, { session });
    await RefreshToken.updateMany(
      { userId: id },
      { deletedAt: now },
      { session },
    );
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}
