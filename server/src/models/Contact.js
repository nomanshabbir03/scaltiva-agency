const mongoose = require('mongoose')

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    service: { type: String, enum: ['development', 'automation', 'seo', 'marketing', 'other'], default: 'other' },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Contact', contactSchema)
