import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler, notFoundHandler } from "./middleware/arror.js";
import authRoutes from "./routes/auth.routes.js";
import { generalLimiter } from "./middleware/rateLimit.js";
export const app = express();

const origins = process.env.FRONTEND_ORIGIN.split(",").map((s) => s.trim());
app.use(helmet());
app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
if (process.env.NODE_ENV === "development") {
  const { default: morgan } = await import("morgan");
  app.use(morgan("dev"));
}
app.use(generalLimiter);
app.get("/api/v1/health", (req, res) => {
  res.send("<h1>API is healthy</h1>");
});
app.use("/api/v1/auth", authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
