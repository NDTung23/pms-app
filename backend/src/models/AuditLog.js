const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action:     { type: String, required: true },
  resource:   { type: String },
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  detail:     { type: String },
  ip:         { type: String },
  oldValue:   { type: mongoose.Schema.Types.Mixed },
  newValue:   { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true })

module.exports = mongoose.model('AuditLog', auditLogSchema)
