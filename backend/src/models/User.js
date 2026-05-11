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
    resetTokenExpres: { type: Date },
  },
  { timestamps: true },
);

UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.resetToken;
    delete ret.resetTokenExpres;
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model("User", UserSchema);
