import mongoose from "mongoose";

export const connectDb = async () => {
  if (!process.env.MONGO_URI) {
    console.log("MongoDB not configured. Using local JSON development store.");
    return false;
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
  return true;
};

export const isMongoConnected = () => mongoose.connection.readyState === 1;
