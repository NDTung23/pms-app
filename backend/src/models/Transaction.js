const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  budget:      { type: mongoose.Schema.Types.ObjectId, ref: 'Budget' },
  type:        { type: String, enum: ['income', 'expense'], required: true },
  category:    { type: String, default: 'Chung' },
  amount:      { type: Number, required: true },
  description: { type: String, default: '' },
  status:      { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt:  { type: Date },
  date:        { type: Date, default: Date.now },
}, { timestamps: true })

module.exports = mongoose.model('Transaction', transactionSchema)
