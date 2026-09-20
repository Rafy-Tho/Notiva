import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler, notFoundHandler } from "../common/errors/errorHandler.js";
import { generalLimiter } from "../common/middleware/rateLimiter.js";

export const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN.split(",") }));
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

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
