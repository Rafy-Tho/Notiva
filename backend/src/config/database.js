import mongoose from "mongoose";

export async function connectMongo() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not defined");
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    autoCreate: true,
  });
  console.log("Connected to MongoDB");
}

export function getMongoConnection() {
  return mongoose.connection;
}

export async function shutdownMongo() {
  await mongoose.connection.close();
}
