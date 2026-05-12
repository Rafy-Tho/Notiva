import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import * as c from "../controllers/me.controller.js";
import { asyncHandler } from "../utils/response.js";
import { validate } from "../middleware/validate.js";
import * as v from "../validators/me.validators.js";
import { upload } from "../middleware/upload.js";

const r = Router();

r.use(authRequired);
r.get("/", asyncHandler(c.me));
r.patch("/", validate(v.update), asyncHandler(c.update));
r.post("/password", validate(v.password), asyncHandler(c.changePassword));
r.delete("/", asyncHandler(c.deleteAccount));
r.post("/avatar", upload.single("file"), asyncHandler(c.updateAvatar));

export default r;
