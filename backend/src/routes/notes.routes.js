import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { asyncHandler } from "../utils/response.js";
import * as c from "../controllers/notes.controller.js";
import { validate } from "../middleware/validate.js";
import * as v from "../validators/notes.validators.js";
const r = Router();

r.use(authRequired);
r.get("/", asyncHandler(c.list));
r.post("/", validate(v.create), asyncHandler(c.create));
r.patch("/:id", validate(v.update), asyncHandler(c.update));
r.delete("/:id", asyncHandler(c.remove));
r.get("/:id", asyncHandler(c.get));
r.post("/:id/pin", asyncHandler(c.togglePin));
r.post("/:id/favorite", asyncHandler(c.toggleFavorite));
r.post("/:id/archive", asyncHandler(c.toggleArchive));
export default r;
