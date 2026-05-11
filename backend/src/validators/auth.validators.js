import { body } from "express-validator";

export const registerV = [
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

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    // Valid email format
    .isEmail()
    .withMessage("Invalid email format")
    .bail()
    // Normalize email (lowercase, remove dots for Gmail, etc.)
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    // Minimum length
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .bail()
    // At least one uppercase letter
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .bail()
    // At least one lowercase letter
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .bail()
    // At least one number
    .matches(/[0-9]/)
    .withMessage("Password must contain a number")
    .bail()
    // At least one special character
    .matches(/[!@#$%^&*]/)
    .withMessage("Password must contain a special character")
    .bail()
    // Password cannot contain emojis or non-ASCII characters
    .matches(/^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/)
    .withMessage("Password contains invalid characters"),
];
export const loginV = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    // Valid email format
    .isEmail()
    .withMessage("Invalid email format")
    .bail()
    // Normalize email (lowercase, remove dots for Gmail, etc.)
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    // Minimum length
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .bail()
    // At least one uppercase letter
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .bail()
    // At least one lowercase letter
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .bail()
    // At least one number
    .matches(/[0-9]/)
    .withMessage("Password must contain a number")
    .bail()
    // At least one special character
    .matches(/[!@#$%^&*]/)
    .withMessage("Password must contain a special character")
    .bail()
    // Password cannot contain emojis or non-ASCII characters
    .matches(/^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/)
    .withMessage("Password contains invalid characters"),
];
