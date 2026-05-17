import { body, param } from "express-validator";

export const create = [
  body("title")
    .optional()
    .isString()
    .withMessage("Title must be a string")
    .bail()
    .isLength({ max: 50 })
    .withMessage("Title must be between 2 and 50 characters")
    .bail(),

  body("content")
    .optional()
    .isString()
    .withMessage("Content must be a string")
    .bail()
    .isLength({ max: 1000 })
    .withMessage("Content must be between 2 and 1000 characters")
    .bail(),

  body("notebookId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Invalid notebook id")
    .bail(),

  body("tagsIds")
    .optional({ nullable: true })
    .isArray({ min: 0 })
    .withMessage("Invalid tags")
    .bail(),

  body("tagsIds.*").optional().isMongoId().withMessage("Invalid tag id").bail(),
];

export const update = [
  param("id").isMongoId().withMessage("Invalid note id").bail(),

  body("title")
    .optional()
    .isString()
    .withMessage("Title must be a string")
    .bail()
    .isLength({ max: 50 })
    .withMessage("Title must be between 2 and 50 characters")
    .bail(),

  body("content")
    .optional()
    .isString()
    .withMessage("Content must be a string")
    .bail()
    .isLength({ max: 1000 })
    .withMessage("Content must be between 2 and 1000 characters")
    .bail(),

  body("notebookId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Invalid notebook id")
    .bail(),

  body("tagsIds")
    .optional({ nullable: true })
    .isArray({ min: 0 })
    .withMessage("Invalid tags")
    .bail(),

  body("tagsIds.*").optional().isMongoId().withMessage("Invalid tag id").bail(),

  body("isPinned")
    .optional()
    .isBoolean()
    .withMessage("isPinned must be a boolean")
    .bail(),

  body("isArchived")
    .optional()
    .isBoolean()
    .withMessage("isArchived must be a boolean")
    .bail(),

  body("isFavourite")
    .optional()
    .isBoolean()
    .withMessage("isFavourite must be a boolean")
    .bail(),
];
