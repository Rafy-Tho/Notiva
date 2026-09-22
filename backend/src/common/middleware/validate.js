import { validationResult } from "express-validator";

export function validate(validators) {
  return async (req, res, next) => {
    try {
      await Promise.all(validators.map((v) => v.run(req)));
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      const err = new Error("Validation failed");
      err.status = 400;
      err.code = "VALIDATION_ERROR";
      err.errors = errors.array().map((e) => e.msg);
      next(err);
    } catch (err) {
      next(err);
    }
  };
}
