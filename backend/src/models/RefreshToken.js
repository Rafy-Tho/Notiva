import mongoose from "mongoose";

const { Schema } = mongoose;

const RefreshTokenSchema = new Schema({
  token: { type: String, required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  userAgent: String,
  ip: String,
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema);
