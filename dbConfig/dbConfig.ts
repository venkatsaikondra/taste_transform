import mongoose from "mongoose";

declare global {
  // Allow caching across module reloads in development
  // eslint-disable-next-line no-var
  var __mongooseGlobal: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.warn('MONGO_URI is not defined. Database features will be disabled.');
}

/**
 * Connect to MongoDB with caching to avoid multiple connections during
 * Next.js hot reloads or serverless cold starts.
 */
export async function connect() {
  if (!MONGO_URI) return;

  if (global.__mongooseGlobal && global.__mongooseGlobal.conn) {
    return global.__mongooseGlobal.conn;
  }

  if (!global.__mongooseGlobal) global.__mongooseGlobal = { conn: null, promise: null };

  if (!global.__mongooseGlobal.promise) {
    global.__mongooseGlobal.promise = mongoose.connect(MONGO_URI).then((mongooseInstance) => {
      console.log('✅ MongoDB connected');
      return mongooseInstance;
    }).catch((err) => {
      console.error('❌ MongoDB connection error:', err);
      throw err;
    });
  }

  global.__mongooseGlobal.conn = await global.__mongooseGlobal.promise;
  return global.__mongooseGlobal.conn;
}