import multer from "multer";
import { storage } from "./storage.js";

export const upload = multer({ storage });
