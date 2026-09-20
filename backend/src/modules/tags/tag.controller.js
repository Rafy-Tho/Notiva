import * as svc from "./tag.service.js";
import { ok } from "../../common/utils/response.js";

export const list = async (req, res) => {
  const tags = await svc.list(req.userId);
  return ok(res, tags, "List tags");
};

export const create = async (req, res) => {
  const tag = await svc.create(req.body.name, req.body.color, req.userId);
  return ok(res, tag, "Create tag", 201);
};

export const update = async (req, res) => {
  const tag = await svc.update(req.params.id, req.body.name, req.body.color);
  return ok(res, tag, "Update tag");
};

export const remove = async (req, res) => {
  const tag = await svc.remove(req.params.id);
  return ok(res, tag, "Remove tag");
};
