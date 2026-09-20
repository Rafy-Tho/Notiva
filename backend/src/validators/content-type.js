import { body, header } from "express-validator";

export const validateContentType = [
  header("Content-Type")
    .isString()
    .isJSON()
    .withMessage("Content-Type header must be application/json")
];
