import { body } from "express-validator";

export const update = [
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
];

export const password = [
  body("oldPassword")
    .notEmpty()
    .withMessage("Old password is required")
    .bail()
    // Minimum length
    .isLength({ min: 8 })
    .withMessage("Old password must be at least 8 characters")
    .bail()
    // At least one uppercase letter
    .matches(/[A-Z]/)
    .withMessage("Old password must contain an uppercase letter")
    .bail()
    // At least one lowercase letter
    .matches(/[a-z]/)
    .withMessage("Old password must contain a lowercase letter")
    .bail()
    // At least one number
    .matches(/[0-9]/)
    .withMessage("Old password must contain a number")
    .bail()
    // At least one special character
    .matches(/[!@#$%^&*]/)
    .withMessage("Old password must contain a special character")
    .bail()
    // Old password cannot contain emojis or non-ASCII characters
    .matches(/^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/)
    .withMessage("Old password contains invalid characters"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .bail()
    // Minimum length
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters")
    .bail()
    // At least one uppercase letter
    .matches(/[A-Z]/)
    .withMessage("New password must contain an uppercase letter")
    .bail()
    // At least one lowercase letter
    .matches(/[a-z]/)
    .withMessage("New password must contain a lowercase letter")
    .bail()
    // At least one number
    .matches(/[0-9]/)
    .withMessage("New password must contain a number")
    .bail()
    // At least one special character
    .matches(/[!@#$%^&*]/)
    .withMessage("New password must contain a special character")
    .bail()
    // New password cannot contain emojis or non-ASCII characters
    .matches(/^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/)
    .withMessage("New password contains invalid characters"),
];
