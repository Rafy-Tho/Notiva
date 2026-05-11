import jwt from "jsonwebtoken";
import crypto from "crypto";

export const signAccess = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_TTL || "15m",
  });

export const signRefresh = (userId) =>
  jwt.sign(
    { sub: userId, jti: crypto.randomUUID() },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_TTL || "7d",
    },
  );

export const verifyAccess = (token) =>
  jwt.verify(token, process.env.JWT_ACCESS_SECRET);

export const verifyRefresh = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET);

export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");
