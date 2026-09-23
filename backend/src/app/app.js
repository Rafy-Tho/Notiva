import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import crypto from "crypto";
import { errorHandler, notFoundHandler } from "../common/errors/errorHandler.js";
import { generalLimiter } from "../common/middleware/rateLimiter.js";
import { httpLogger } from "../common/middleware/httpLogger.js";
import { setupRoutes } from "./routes.js";

export const app = express();

app.set("trust proxy", 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_ORIGIN],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN.split(","),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
}));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(httpLogger);
}

app.use(generalLimiter);

app.use((req, res, next) => {
  req.id = req.headers["x-request-id"] || crypto.randomUUID();
  next();
});

app.get("/", (req, res) => {
  res.send("<h1>API is healthy</h1>");
});

setupRoutes(app);

app.use(notFoundHandler);
app.use(errorHandler);
