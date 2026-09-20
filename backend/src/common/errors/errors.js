export class BadRequestError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "BadRequestError";
    this.status = 400;
    this.code = code ?? "BAD_REQUEST";
  }
}

export class ConflictError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "ConflictError";
    this.status = 409;
    this.code = code ?? "CONFLICT";
  }
}

export class NotFoundError extends Error {
  constructor(message) {
    super(message ?? "Resource not found");
    this.name = "NotFoundError";
    this.status = 404;
    this.code = "NOT_FOUND";
  }
}

export class UnauthorizedError extends Error {
  constructor(message, code) {
    super(message ?? "Unauthorized");
    this.name = "UnauthorizedError";
    this.status = 401;
    this.code = code ?? "UNAUTHORIZED";
  }
}
