import { body } from "express-validator";

export const upsert = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .bail()
    // Must be a string
    .isString()
    .withMessage("Name must be a string")
    .bail()
    // Only letters and spaces allowed
    .matches(/^[\p{L}\s]+$/u)
    .withMessage("Name can only contain letters and spaces")
    .bail()
    //  Minimum length
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("color").optional().isString().isLength({ max: 32 }),
];
