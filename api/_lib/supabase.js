import { createClient } from '@supabase/supabase-js'

// Server-only admin client. It uses the secret key, which bypasses Row Level
// Security, so it must never be imported from anything under /src.
export function supabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error('Supabase env vars are not set')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
