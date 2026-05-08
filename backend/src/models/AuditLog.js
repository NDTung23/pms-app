const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action:     { type: String, required: true },   // 'create', 'update', 'delete', 'login', etc.
  resource:   { type: String },                    // 'project', 'card', 'user', etc.
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  detail:     { type: String },
  ip:         { type: String },
  oldValue:   { type: mongoose.Schema.Types.Mixed },
  newValue:   { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true })

module.exports = mongoose.model('AuditLog', auditLogSchema)
