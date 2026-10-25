const Contact = require('../models/Contact')

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SERVICES = ['development', 'automation', 'seo', 'marketing', 'other']

exports.createContact = async (req, res, next) => {
  try {
    // Only these fields are accepted; anything else in the body is ignored.
    const name = String(req.body.name ?? '').trim()
    const email = String(req.body.email ?? '').trim()
    const message = String(req.body.message ?? '').trim()
    const service = SERVICES.includes(req.body.service) ? req.body.service : 'other'

    if (!name || name.length > 100) {
      return res.status(400).json({ message: 'Please enter your name.' })
    }
    if (!EMAIL.test(email) || email.length > 200) {
      return res.status(400).json({ message: 'Please enter a valid email address.' })
    }
    if (message.length < 10 || message.length > 5000) {
      return res.status(400).json({ message: 'Please tell us a little more about your project (at least 10 characters).' })
    }

    await Contact.create({ name, email, service, message })
    res.status(201).json({ ok: true })
  } catch (err) {
    next(err)
  }
}
