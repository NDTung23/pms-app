const mongoose = require('mongoose')

const budgetSchema = new mongoose.Schema({
  project:        { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plannedAmount:  { type: Number, default: 0 },
  actualAmount:   { type: Number, default: 0 },
  currency:       { type: String, default: 'VND' },
}, { timestamps: true })

module.exports = mongoose.model('Budget', budgetSchema)
