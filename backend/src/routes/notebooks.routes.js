import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { asyncHandler } from "../utils/response.js";
import * as c from "../controllers/notebooks.controller.js";
import { validate } from "../middleware/validate.js";
import * as v from "../validators/notebooks.validators.js";
const r = Router();

r.use(authRequired);
r.get("/", asyncHandler(c.list));
r.post("/", validate(v.upsert), asyncHandler(c.create));
r.patch("/:id", validate(v.upsert), asyncHandler(c.update));
r.delete("/:id", asyncHandler(c.remove));

export default r;
