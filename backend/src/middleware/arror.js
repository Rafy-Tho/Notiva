export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    data: null,
    error: "Not Found",
    message: `Not Found ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(err, req, res, _next) {
  const status = err.status || err.name === "ValidationError" ? 400 : 500;
  res.status(status).json({
    success: false,
    data: null,
    error:
      process.env.NODE_ENV !== "production"
        ? err.code || err.name || "Error"
        : "Error",
    message: err.message || "Internal Server Error",
  });
}
