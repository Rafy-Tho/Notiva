import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import { validate } from "../../common/middleware/validate.js";
import * as c from "./note.controller.js";
import * as v from "./note.validation.js";
import { asyncHandler } from "../../common/utils/response.js";

const r = Router();

r.use(authenticate);
r.get("/", asyncHandler(c.list));
r.get("/trash", asyncHandler(c.getTrashNotes));
r.get("/counts", asyncHandler(c.getCounts));
r.post("/", validate(v.create), asyncHandler(c.create));
r.patch("/:id", validate(v.update), asyncHandler(c.update));
r.delete("/:id", asyncHandler(c.remove));
r.get("/:id", asyncHandler(c.get));
r.post("/:id/pin", asyncHandler(c.togglePin));
r.post("/:id/favorite", asyncHandler(c.toggleFavorite));
r.post("/:id/archive", asyncHandler(c.toggleArchive));
r.post("/:id/restore", asyncHandler(c.restore));
r.post("/:id/purge", asyncHandler(c.purge));

export default r;
