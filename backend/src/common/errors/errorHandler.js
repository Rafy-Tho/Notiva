export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    data: null,
    code: "Not Found",
    message: `Not Found ${req.method} ${req.originalUrl}`,
  });
}

function normalizeError(err) {
  if (typeof err.code === "string" && /^P\d{4}$/.test(err.code)) {
    switch (err.code) {
      case "P2002": {
        const target = err.meta?.target;
        const field = Array.isArray(target)
          ? target.join(", ")
          : target ?? "field";
        return {
          status: 409,
          code: "DUPLICATE_KEY",
          message: `${field} already exists`,
        };
      }
      case "P2025":
        return {
          status: 404,
          code: "NOT_FOUND",
          message: "Resource not found",
        };
      case "P2003":
        return {
          status: 400,
          code: "FOREIGN_KEY_VIOLATION",
          message: "Related record not found",
        };
      case "P2000":
        return {
          status: 400,
          code: "VALUE_TOO_LONG",
          message: "Provided value is too long",
        };
      case "P2004":
        return {
          status: 400,
          code: "CONSTRAINT_FAILED",
          message: "Database constraint failed",
        };
      default:
        return {
          status: 400,
          code: "DATABASE_ERROR",
          message: "Database request failed",
        };
    }
  }

  if (err.name === "PrismaClientValidationError") {
    return {
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Invalid request data",
    };
  }

  if (err.name === "PrismaClientInitializationError") {
    return {
      status: 503,
      code: "DATABASE_UNAVAILABLE",
      message: "Database unavailable",
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

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const { status, code, message } = normalizeError(err);

  if (status === 500 && process.env.NODE_ENV === "development") {
    console.error(
      `[${new Date().toISOString()}] ${req.method} ${req.url}`,
      err.stack || err,
    );
  }

  const responseMessage =
    process.env.NODE_ENV === "production" && status === 500
      ? "Internal Server Error"
      : message;

  res.status(status).json({
    success: false,
    data: null,
    code,
    message: responseMessage,
  });
}
