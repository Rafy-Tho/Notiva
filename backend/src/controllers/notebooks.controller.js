import * as svc from "../services/notebook.service.js";
import { ok } from "../utils/response.js";

// @desc List notebooks
// @route GET /notebooks
//  @access Private
export const list = async (req, res) => {
  const notebooks = await svc.list(req.userId);
  return ok(res, notebooks, "List notebooks");
};
// @desc Create notebook
// @route POST /notebooks
//  @access Private
export const create = async (req, res) => {
  const notebook = await svc.create(req.body.name, req.body.color, req.userId);
  return ok(res, notebook, "Create notebook");
};
// @desc Update notebook
// @route PATCH /notebooks/:id
//  @access Private
export const update = async (req, res) => {
  const notebook = await svc.update(
    req.params.id,
    req.body.name,
    req.body.color,
    req.userId,
  );
  return ok(res, notebook, "Update notebook");
};
// @desc Remove notebook
// @route DELETE /notebooks/:id
//  @access Private
export const remove = async (req, res) => {
  const notebook = await svc.remove(req.params.id);
  return ok(res, notebook, "Remove notebook");
};
