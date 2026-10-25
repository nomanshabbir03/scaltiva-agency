import mongoose from 'mongoose'

// Serverless functions are re-used between requests, so the connection is
// cached on globalThis instead of reconnecting every time.
const cache = (globalThis._mongoose ??= { conn: null, promise: null })

export async function connectDB() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not set')
  if (cache.conn) return cache.conn
  cache.promise ??= mongoose.connect(process.env.MONGO_URI, { bufferCommands: false })
  cache.conn = await cache.promise
  return cache.conn
}
