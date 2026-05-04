const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:          { type: String, required: true }, // 'assigned', 'deadline', 'comment'...
  title:         { type: String, required: true },
  body:          { type: String, default: '' },
  referenceId:   { type: mongoose.Schema.Types.ObjectId },
  referenceType: { type: String }, // 'card', 'project', 'sprint'
  isRead:        { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Notification', notificationSchema)
