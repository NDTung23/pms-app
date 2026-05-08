const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ['admin', 'pm', 'member'], default: 'member' },
  isActive:  { type: Boolean, default: true },
  avatarUrl: { type: String, default: '' },
  phone:     { type: String, default: '' },
  timezone:  { type: String, default: 'Asia/Ho_Chi_Minh' },
  language:  { type: String, default: 'vi' },
  lastLogin: { type: Date },
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)
