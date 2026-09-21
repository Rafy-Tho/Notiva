import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  })
  .transform((data) => ({
    name: data.name.trim(),
    email: data.email.trim(),
    password: data.password,
  }));

// Profile schemas
export const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

// Note schemas
export const noteSchema = z.object({
  title: z.string().max(500, "Title must be less than 500 characters"),
  content: z.string(),
});

// Notebook schemas
export const notebookSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  color: z.string(),
});

// Tag schemas
export const tagSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  color: z.string(),
});

// Validation utilities
export function validateForm(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      errors[field] = issue.message;
    }
    return { valid: false, errors };
  }
  return { valid: true, data: result.data };
}

export function useValidation(schema) {
  const validate = (data) => validateForm(schema, data);
  return { validate };
}

export default validateForm;
