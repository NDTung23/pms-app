const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['pm', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
  }],
  status:     { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
  startDate:  { type: Date },
  endDate:    { type: Date },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Project', projectSchema)
