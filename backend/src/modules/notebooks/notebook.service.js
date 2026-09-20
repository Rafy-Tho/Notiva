import * as repo from "./notebook.repository.js";

export const list = async (userId) => {
  return repo.list(userId);
};

export const create = async (name, color, userId) => {
  return repo.create(name, color, userId);
};

export const update = async (id, name, color, userId) => {
  return repo.update(id, name, color, userId);
};

export const remove = async (id, userId) => {
  return repo.remove(id, userId);
};
