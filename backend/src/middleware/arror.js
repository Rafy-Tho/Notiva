import * as svc from "../services/auth.service.js";
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    data: null,
    code: "Not Found",
    message: `Not Found ${req.method} ${req.originalUrl}`,
  });
}
// middleware/errorHandler.js

function normalizeError(err) {
  // ── Mongoose Validation Error ──────────────────────────────────
  // Triggered by schema validators (required, minlength, enum, etc.)
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return {
      status: 400,
      code: "VALIDATION_ERROR",
      message: messages.join(", "),
    };
  }

  // ── Mongoose Duplicate Key Error ───────────────────────────────
  // Triggered by unique: true constraint
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? "field";
    return {
      status: 409,
      code: "DUPLICATE_KEY",
      message: `${field} already exists`,
    };
  }

  // ── Mongoose Cast Error ────────────────────────────────────────
  // Triggered by invalid ObjectId: findById("not-an-id")
  if (err.name === "CastError") {
    return {
      status: 400,
      code: "INVALID_ID",
      message: `Invalid value for field: ${err.path}`,
    };
  }

  // ── Mongoose Document Not Found ────────────────────────────────
  // Triggered by query.orFail()
  if (err.name === "DocumentNotFoundError") {
    return {
      status: 404,
      code: "NOT_FOUND",
      message: "Resource not found",
    };
  }

  // ── JWT Errors ─────────────────────────────────────────────────
  if (err.name === "TokenExpiredError") {
    return {
      status: 401,
      code: "TOKEN_EXPIRED",
      message: "Token has expired",
    };
  }

  if (err.name === "JsonWebTokenError") {
    return {
      status: 401,
      code: "TOKEN_INVALID",
      message: "Invalid token",
    };
  }

  if (err.name === "NotBeforeError") {
    return {
      status: 401,
      code: "TOKEN_NOT_ACTIVE",
      message: "Token not yet active",
    };
  }

  // ── App-level errors (thrown manually with a status) ───────────
  // e.g: const err = new Error("Not found"); err.status = 404; throw err;
  if (err.status) {
    return {
      status: err.status,
      code: err.code ?? "APP_ERROR",
      message: err.message,
    };
  }

  // ── Fallback ───────────────────────────────────────────────────
  return {
    status: 500,
    code: "INTERNAL_ERROR",
    message: "Internal Server Error",
  };
}

export function errorHandler(err, req, res, _next) {
  const { status, code, message } = normalizeError(err);

  // Clear refresh cookie
  if (
    [
      "NO_TOKEN",
      "INVALID_REFRESH_TOKEN",
      "TOKEN_REUSE",
      "TOKEN_INVALID",
      "TOKEN_EXPIRED",
      "TOKEN_NOT_ACTIVE",
      "REFRESH_FAILED",
      "USER_NOT_FOUND",
    ].includes(code)
  ) {
    res.clearCookie("rt", svc.cookieOpts());
  }

  // Log unexpected server errors
  if (status === 500) {
    console.error(
      `[${new Date().toISOString()}] ${req.method} ${req.url}`,
      err,
    );
  }

  res.status(status).json({
    success: false,
    data: null,
    code,
    message:
      process.env.NODE_ENV === "production" && status === 500
        ? "Internal Server Error" // hide details in production
        : message,
  });
}
