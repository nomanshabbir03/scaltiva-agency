const router = require('express').Router()
const { createContact } = require('../controllers/contactController')

// Simple in-memory limiter: 5 submissions per IP per 15 minutes.
// (Resets on restart and is per-process; use a shared store if you scale out.)
const WINDOW_MS = 15 * 60 * 1000
const MAX = 5
const hits = new Map()

function limit(req, res, next) {
  const now = Date.now()
  const recent = (hits.get(req.ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX) {
    return res.status(429).json({ message: 'Too many messages. Please try again in a few minutes.' })
  }
  recent.push(now)
  hits.set(req.ip, recent)
  next()
}

router.post('/', limit, createContact)

module.exports = router
