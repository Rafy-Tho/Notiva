import { User } from "../models/User.js";

export async function findByEmail(email) {
  return User.findOne({ email });
}

export async function create({ name, email, password }) {
  return User.create({ name, email, password });
}

export async function findById(id) {
  return User.findById(id);
}

export async function update(id, updates) {
  return User.findByIdAndUpdate(id, updates, { new: true });
}

export async function setPassword(id, password) {
  return User.findByIdAndUpdate(id, { password }, { new: true });
}
