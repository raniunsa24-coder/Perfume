import mongoose from 'mongoose';

// Reuse one connection across requests (needed on Vercel serverless, harmless locally).
const cache = globalThis.__mongoCache || (globalThis.__mongoCache = { conn: null, promise: null });

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is missing. Add it to backend/.env (or the Vercel environment variables).');
  if (cache.conn && mongoose.connection.readyState === 1) return cache.conn;
  mongoose.set('strictQuery', true);
  cache.promise = cache.promise || mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, bufferCommands: false });
  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
  return cache.conn;
}
