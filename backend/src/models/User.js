const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true, minlength: 6 },
  role:      { type: String, enum: ['admin', 'pm', 'member'], default: 'member' },
  avatarUrl: { type: String, default: '' },
  isActive:  { type: Boolean, default: true },
  lastLogin: { type: Date },
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)
