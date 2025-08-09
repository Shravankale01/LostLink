import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in your .env file");
}

// Define type for cached mongoose connection on globalThis
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // allow globalThis.mongooseCache to be undefined initially
  var mongooseCache: MongooseCache | undefined;
}

// Initialize cache or reuse existing
let cached: MongooseCache;

if (!globalThis.mongooseCache) {
  globalThis.mongooseCache = { conn: null, promise: null };
}

cached = globalThis.mongooseCache;

async function connectDB() {
  // Non-null assertion (!) prevents TS "possibly undefined" error
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "lostfound",
      bufferCommands: false,
    }).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
