const mongoose = require('mongoose')

const sprintSchema = new mongoose.Schema({
  project:   { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title:     { type: String, required: true },
  goal:      { type: String, default: '' },
  startDate: { type: Date },
  endDate:   { type: Date },
  status:    { type: String, enum: ['planning', 'active', 'closed'], default: 'planning' },
  velocity:  { type: Number, default: 0 }, // story points hoàn thành
}, { timestamps: true })

module.exports = mongoose.model('Sprint', sprintSchema)
