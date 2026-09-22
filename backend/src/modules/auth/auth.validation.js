import { body } from "express-validator";

export const registerV = [
  body("name").isString().isLength({ max: 50 }).withMessage("Name too long"),
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

export const loginV = [
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password required"),
];

export const forgotV = [
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
];

export const resetV = [
  body("token").notEmpty().withMessage("Token required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

export const resendVerificationV = [
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
];

export const verifyEmailV = [
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
  body("code").isLength({ min: 6, max: 6 }).withMessage("Code must be 6 digits"),
];

export const resetPasswordV = [
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
];

export const confirmPasswordResetV = [
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
  body("code").isLength({ min: 6, max: 6 }).withMessage("Code must be 6 digits"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];
