import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import { validate } from "../../common/middleware/validate.js";
import * as c from "./tag.controller.js";
import * as v from "./tag.validation.js";
import { asyncHandler } from "../../common/utils/response.js";

const r = Router();

r.use(authenticate);
r.get("/", asyncHandler(c.list));
r.post("/", validate(v.create), asyncHandler(c.create));
r.patch("/:id", validate(v.update), asyncHandler(c.update));
r.delete("/:id", asyncHandler(c.remove));

export default r;
