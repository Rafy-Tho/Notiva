import * as svc from "./notebook.service.js";
import { ok } from "../../common/utils/response.js";

export const list = async (req, res) => {
  const notebooks = await svc.list(req.userId);
  return ok(res, notebooks, "List notebooks");
};

export const create = async (req, res) => {
  const notebook = await svc.create(req.body.name, req.body.color, req.userId);
  return ok(res, notebook, "Create notebook", 201);
};

export const update = async (req, res) => {
  const notebook = await svc.update(
    req.params.id,
    req.body.name,
    req.body.color,
  );
  return ok(res, notebook, "Update notebook");
};

export const remove = async (req, res) => {
  const notebook = await svc.remove(req.params.id);
  return ok(res, notebook, "Remove notebook");
};
