import { Router } from "express";
import * as c from "../controllers/auth.controller.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";
import {
  forgotV,
  loginV,
  registerV,
  resetV,
} from "../validators/auth.validators.js";
import { asyncHandler } from "../utils/response.js";

const r = Router();

r.use(authLimiter);
r.post("/register", validate(registerV), asyncHandler(c.register));
r.post("/login", validate(loginV), asyncHandler(c.login));
r.post("/logout", asyncHandler(c.logout));
r.post("/refresh", asyncHandler(c.refresh));
r.post("/forgot-password", validate(forgotV), asyncHandler(c.forgotPassword));
r.post("/reset-password", validate(resetV), asyncHandler(c.resetPassword));

export default r;
