import jwt from "jsonwebtoken";
import crypto from "crypto";

export const signToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_TTL || "7d",
  });

export const verifyToken = (token) =>
  jwt.verify(token, process.env.JWT_ACCESS_SECRET);

export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");
