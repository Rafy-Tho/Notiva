import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler, notFoundHandler } from "../common/errors/errorHandler.js";
import { generalLimiter } from "../common/middleware/rateLimiter.js";

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
  const { default: morgan } = await import("morgan");
  app.use(morgan("dev"));
}

app.use(generalLimiter);

app.get("/", (req, res) => {
  res.send("<h1>API is healthy</h1>");
});

app.use(notFoundHandler);
app.use(errorHandler);
