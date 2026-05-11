import { validationResult } from "express-validator";

export const validate = (chains) => async (req, res, next) => {
  await Promise.all(chains.map((c) => c.run(req)));
  const errs = validationResult(req);
  if (errs.isEmpty()) return next();
  return res.status(400).json({
    success: false,
    data: null,
    error: "ValidationError",
    message: errs
      .array()
      .map((e) => e.msg)
      .join(", "),
  });
};
