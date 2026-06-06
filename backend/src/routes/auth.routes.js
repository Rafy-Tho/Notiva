import { Router } from "express";
import * as c from "../controllers/auth.controller.js";
import { authRequired } from "../middleware/auth.js";
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
r.post("/forgot-password", validate(forgotV), asyncHandler(c.forgotPassword));
r.post("/reset-password", validate(resetV), asyncHandler(c.resetPassword));
r.post("/logout", asyncHandler(c.logout));
r.get("/verify", authRequired, asyncHandler(c.verify));

export default r;
