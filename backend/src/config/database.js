import mongoose from "mongoose";

export function connectMongo() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  mongoose.set("strictQuery", true);

  return mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Connected to MongoDB");
  });
}
