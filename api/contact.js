import { connectDB } from './_lib/db.js'
import Contact from './_lib/Contact.js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SERVICES = ['development', 'automation', 'seo', 'marketing', 'other']

// Best-effort limiter: 5 submissions per IP per 15 minutes. On serverless it
// only holds per warm instance, so treat it as a speed bump, not a guarantee.
const WINDOW_MS = 15 * 60 * 1000
const MAX = 5
const hits = new Map()

function tooMany(ip) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX) return true
  recent.push(now)
  hits.set(ip, recent)
  return false
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method not allowed.' })
  }

  const ip = String(req.headers['x-forwarded-for'] ?? req.socket?.remoteAddress ?? '').split(',')[0].trim()
  if (tooMany(ip)) {
    return res.status(429).json({ message: 'Too many messages. Please try again in a few minutes.' })
  }

  // Only these fields are accepted; anything else in the body is ignored.
  const body = req.body ?? {}
  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').trim()
  const message = String(body.message ?? '').trim()
  const service = SERVICES.includes(body.service) ? body.service : 'other'

  if (!name || name.length > 100) {
    return res.status(400).json({ message: 'Please enter your name.' })
  }
  if (!EMAIL.test(email) || email.length > 200) {
    return res.status(400).json({ message: 'Please enter a valid email address.' })
  }
  if (message.length < 10 || message.length > 5000) {
    return res.status(400).json({ message: 'Please tell us a little more about your project (at least 10 characters).' })
  }

  try {
    await connectDB()
    await Contact.create({ name, email, service, message })
    return res.status(201).json({ ok: true })
  } catch (err) {
    console.error('Contact form error:', err)
    return res.status(500).json({ message: 'Something went wrong. Please try again later.' })
  }
}
