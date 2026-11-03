import { requireAdmin } from './_lib/auth.js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Long enough to mean "until re-enabled". Supabase has no permanent ban.
const BAN = '876000h'

function cleanName(value) {
  const name = String(value ?? '').trim()
  return name && name.length <= 100 ? name : null
}

function cleanPassword(value) {
  const password = String(value ?? '')
  return password.length >= 8 && password.length <= 72 ? password : null
}

// Admin-only student actions that need the secret key:
//   { action: 'create', fullName, email, password }
//   { action: 'update', id, fullName, isActive }
//   { action: 'reset-password', id, password }
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method not allowed.' })
  }

  const admin = await requireAdmin(req, res)
  if (!admin) return

  const body = req.body ?? {}

  try {
    if (body.action === 'create') {
      const fullName = cleanName(body.fullName)
      const email = String(body.email ?? '').trim().toLowerCase()
      const password = cleanPassword(body.password)
      if (!fullName) return res.status(400).json({ message: 'Please enter the student’s name.' })
      if (!EMAIL.test(email) || email.length > 200) return res.status(400).json({ message: 'Please enter a valid email address.' })
      if (!password) return res.status(400).json({ message: 'The password must be 8 to 72 characters.' })

      const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
      if (error) {
        if (error.code === 'email_exists') return res.status(409).json({ message: 'A user with this email already exists.' })
        throw error
      }

      const { error: profileError } = await admin
        .from('profiles')
        .insert({ id: data.user.id, full_name: fullName, email, role: 'student' })
      if (profileError) {
        // No orphan login without a profile.
        await admin.auth.admin.deleteUser(data.user.id)
        throw profileError
      }
      return res.status(201).json({ id: data.user.id })
    }

    const id = String(body.id ?? '')
    const { data: student } = await admin.from('profiles').select('id, role').eq('id', id).maybeSingle()
    if (!student || student.role !== 'student') return res.status(404).json({ message: 'Student not found.' })

    if (body.action === 'update') {
      const fullName = cleanName(body.fullName)
      if (!fullName) return res.status(400).json({ message: 'Please enter the student’s name.' })
      const isActive = body.isActive === true

      const { error } = await admin.from('profiles').update({ full_name: fullName, is_active: isActive }).eq('id', id)
      if (error) throw error
      // Banning stops the login from refreshing; RLS already blocks a disabled profile's data.
      const { error: banError } = await admin.auth.admin.updateUserById(id, { ban_duration: isActive ? 'none' : BAN })
      if (banError) throw banError
      return res.status(200).json({ ok: true })
    }

    if (body.action === 'reset-password') {
      const password = cleanPassword(body.password)
      if (!password) return res.status(400).json({ message: 'The password must be 8 to 72 characters.' })
      const { error } = await admin.auth.admin.updateUserById(id, { password })
      if (error) throw error
      return res.status(200).json({ ok: true })
    }

    return res.status(400).json({ message: 'Unknown action.' })
  } catch (err) {
    console.error('Admin students error:', err)
    return res.status(500).json({ message: 'Something went wrong. Please try again.' })
  }
}
