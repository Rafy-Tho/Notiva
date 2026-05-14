import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fieldSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => cb(null, /^image\//.test(file.mimetype)),
});
