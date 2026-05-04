const mongoose = require('mongoose')

const sprintSchema = new mongoose.Schema({
  project:   { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  name:      { type: String, required: true },
  goal:      { type: String, default: '' },
  status:    { type: String, enum: ['planning', 'active', 'closed'], default: 'planning' },
  startDate: { type: Date },
  endDate:   { type: Date },
}, { timestamps: true })

module.exports = mongoose.model('Sprint', sprintSchema)
