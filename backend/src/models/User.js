import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: { type: String, required: true },
    avatar: { type: String },
    resetToken: { type: String },
    resetTokenExpires: { type: Date },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.resetToken;
    delete ret.resetTokenExpires;
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model("User", UserSchema);
