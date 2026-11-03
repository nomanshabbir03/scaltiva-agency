import { supabaseAdmin } from './supabase.js'

// Every admin API call must start with this. It reads the caller's Supabase
// access token from the Authorization header and checks, on the server, that
// it belongs to an active admin. Returns the admin client, or null after
// sending a 401/403 response.
export async function requireAdmin(req, res) {
  const token = String(req.headers.authorization ?? '').replace(/^Bearer /, '')
  if (!token) {
    res.status(401).json({ message: 'Please sign in.' })
    return null
  }

  const admin = supabaseAdmin()
  const { data, error } = await admin.auth.getUser(token)
  if (error || !data.user) {
    res.status(401).json({ message: 'Your session has expired. Please sign in again.' })
    return null
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('role, is_active')
    .eq('id', data.user.id)
    .maybeSingle()
  if (profile?.role !== 'admin' || !profile.is_active) {
    res.status(403).json({ message: 'Admins only.' })
    return null
  }

  return admin
}
