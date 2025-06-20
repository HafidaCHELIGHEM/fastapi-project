import mongoose from "mongoose";

export const connectMongoDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(
      "hani Connected to MongoDB Database:",
      conn.connection.db.databaseName
    );
    return conn;
  } catch (error) {
    console.log("Error connecting to MongoDB: ", error);
    throw error;
  }
};
