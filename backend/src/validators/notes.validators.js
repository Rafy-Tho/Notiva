import { body, param } from "express-validator";
import { MAX_NOTE_CONTENT_LENGTH } from "../config/limits.js";

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
    .isLength({ max: MAX_NOTE_CONTENT_LENGTH })
    .withMessage("Content is too large")
    .bail(),

  body("notebookId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Invalid notebook id")
    .bail(),

  body("tagIds")
    .optional({ nullable: true })
    .isArray({ min: 0 })
    .withMessage("Invalid tags")
    .bail(),

  body("tagIds.*").optional().isMongoId().withMessage("Invalid tag id").bail(),
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
    .isLength({ max: MAX_NOTE_CONTENT_LENGTH })
    .withMessage("Content is too large")
    .bail(),

  body("notebookId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Invalid notebook id")
    .bail(),

  body("tagIds")
    .optional({ nullable: true })
    .isArray({ min: 0 })
    .withMessage("Invalid tags")
    .bail(),

  body("tagIds.*").optional().isMongoId().withMessage("Invalid tag id").bail(),

  body("cover")
    .optional({ nullable: true })
    .isObject()
    .withMessage("Invalid cover")
    .bail(),

  body("cover.color")
    .optional({ nullable: true })
    .isString()
    .withMessage("Invalid cover color")
    .bail()
    .isLength({ max: 50 })
    .withMessage("Cover color is too long"),

  body("cover.emoji")
    .optional({ nullable: true })
    .isString()
    .withMessage("Invalid cover emoji")
    .bail()
    .isLength({ max: 20 })
    .withMessage("Cover emoji is too long"),

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

  body("isFavorite")
    .optional()
    .isBoolean()
    .withMessage("isFavourite must be a boolean")
    .bail(),

  body("expectedUpdatedAt")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Invalid expected update time"),
];
