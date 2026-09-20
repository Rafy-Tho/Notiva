export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    data: null,
    code: "Not Found",
    message: `Not Found ${req.method} ${req.originalUrl}`,
  });
}

function normalizeError(err) {
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return {
      status: 400,
      code: "VALIDATION_ERROR",
      message: messages.join(", "),
    };
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? "field";
    return {
      status: 409,
      code: "DUPLICATE_KEY",
      message: `${field} already exists`,
    };
  }

  if (err.name === "CastError") {
    return {
      status: 400,
      code: "INVALID_ID",
      message: `Invalid value for field: ${err.path}`,
    };
  }

  if (err.name === "DocumentNotFoundError") {
    return {
      status: 404,
      code: "NOT_FOUND",
      message: "Resource not found",
    };
  }

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

  if (err.status) {
    return {
      status: err.status,
      code: err.code ?? "APP_ERROR",
      message: err.message,
    };
  }

  return {
    status: 500,
    code: "INTERNAL_ERROR",
    message: "Internal Server Error",
  };
}

export function errorHandler(err, req, res, _next) {
  const { status, code, message } = normalizeError(err);

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
        ? "Internal Server Error"
        : message,
  });
}
