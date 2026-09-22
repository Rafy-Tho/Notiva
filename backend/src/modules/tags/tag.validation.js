import { body, param } from "express-validator";

export const create = [
  body("name").notEmpty().isString().isLength({ max: 50 }).withMessage("Invalid name"),
  body("color").optional().isString().withMessage("Invalid color"),
];

export const update = [
  param("id").isUUID().withMessage("Invalid tag id").bail(),
  body("name").optional().isString().isLength({ max: 50 }).withMessage("Invalid name"),
  body("color").optional().isString().withMessage("Invalid color"),
];
