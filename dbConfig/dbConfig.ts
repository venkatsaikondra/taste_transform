import mongoose from "mongoose";

export async function connect() {
  try {
    // Check if URI exists before trying to connect
    const uri = process.env.MONGO_URI;
    
    if (!uri) {
      throw new Error("MONGO_URI is not defined in your environment variables.");
    }

    // Check if we are already connected to avoid multiple connections in Dev
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    await mongoose.connect(uri);

    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("✅ MongoDB connected successfully");
    });

    connection.on("error", (err) => {
      console.error("❌ MongoDB connection error. Please make sure MongoDB is running. " + err);
      process.exit();
    });

  } catch (error) {
    console.error("❌ Something went wrong while connecting to DB");
    console.error(error);
  }
}