import * as svc from "../services/me.service.js";
import { uploadImage } from "../services/upload.service.js";
import { ok } from "../utils/response.js";

export const me = async (req, res) => {
  const user = await svc.me(req.userId);
  return ok(res, user, "Get user");
};

export const update = async (req, res) => {
  const user = await svc.update(req.userId, req.body.name);
  return ok(res, user, "Update user");
};

export const changePassword = async (req, res) => {
  const user = await svc.changePassword(req.userId, req.body);
  return ok(res, user, "Change password");
};

export const deleteAccount = async (req, res) => {
  await svc.deleteAccount(req.userId);
  return ok(res, null, "Delete account");
};

export const updateAvatar = async (req, res) => {
  const result = await uploadImage(req.file);
  const user = await svc.updateAvatar(req.userId, result.secure_url);
  return ok(res, user, "Update avatar");
};

export const removeAvatar = async (req, res) => {
  const user = await svc.updateAvatar(req.userId, "");
  return ok(res, user, "Update avatar");
};
