import * as repo from "./tag.repository.js";

export const list = async (userId) => {
  return repo.list(userId);
};

export const create = async (name, color, userId) => {
  return repo.create(name, color, userId);
};

export const update = async (id, name, color) => {
  return repo.update(id, name, color);
};

export const remove = async (id) => {
  return repo.remove(id);
};
