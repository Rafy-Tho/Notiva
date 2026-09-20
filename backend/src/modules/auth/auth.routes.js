import { Router } from "express";
import * as c from "./auth.controller.js";
import { authLimiter } from "../../common/middleware/rateLimiter.js";
import { validate } from "../../common/middleware/validate.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { forgotV, loginV, registerV, resetV } from "./auth.validation.js";
import { asyncHandler } from "../../common/utils/response.js";

const r = Router();

r.use(authLimiter);
r.post("/register", validate(registerV), asyncHandler(c.register));
r.post("/login", validate(loginV), asyncHandler(c.login));
r.post("/forgot-password", validate(forgotV), asyncHandler(c.forgotPassword));
r.post("/reset-password", validate(resetV), asyncHandler(c.resetPassword));
r.post("/logout", asyncHandler(c.logout));
r.get("/verify", authenticate, asyncHandler(c.verify));

export default r;
