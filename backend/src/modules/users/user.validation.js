import { body } from "express-validator";

export const update = [
  body("name").isString().isLength({ max: 50 }).withMessage("Name too long"),
];

export const password = [
  body("oldPassword").notEmpty().withMessage("Old password required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters"),
];
