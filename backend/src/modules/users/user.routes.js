import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import * as c from "./user.controller.js";
import { asyncHandler } from "../../common/utils/response.js";
import { validate } from "../../common/middleware/validate.js";
import { update as updateV, password as passwordV } from "./user.validation.js";
import { upload } from "../upload/upload.js";

const r = Router();

r.use(authenticate);
r.get("/", asyncHandler(c.me));
r.patch("/", validate(updateV), asyncHandler(c.update));
r.post("/password", validate(passwordV), asyncHandler(c.changePassword));
r.delete("/", asyncHandler(c.deleteAccount));
r.post("/avatar", upload.single("file"), asyncHandler(c.updateAvatar));
r.delete("/avatar", asyncHandler(c.removeAvatar));
export default r;
