import * as svc from "../services/tags.service.js";
import { ok } from "../utils/response.js";

// @desc List tag
// @route GET /tags
//  @access Private
export const list = async (req, res) => {
  const tag = await svc.list(req.userId);
  return ok(res, tag, "List tags");
};
// @desc Create tag
// @route POST /tags
//  @access Private
export const create = async (req, res) => {
  const tag = await svc.create(req.body.name, req.body.color, req.userId);
  return ok(res, tag, "Create tag");
};
// @desc Update tag
// @route PATCH /tags/:id
//  @access Private
export const update = async (req, res) => {
  const tag = await svc.update(req.params.id, req.body.name, req.body.color);
  return ok(res, tag, "Update tag");
};
// @desc Remove tag
// @route DELETE /tags/:id
//  @access Private
export const remove = async (req, res) => {
  const tag = await svc.remove(req.params.id);
  return ok(res, tag, "Remove tag");
};
