import { Router } from "express";
import * as c from "../controllers/auth.controller.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";
import { registerV } from "../validators/auth.validators.js";
import { asyncHandler } from "../utils/response.js";

const r = Router();

r.use(authLimiter);
r.post("/register", validate(registerV), asyncHandler(c.register));

export default r;
