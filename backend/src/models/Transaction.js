const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  budget:          { type: mongoose.Schema.Types.ObjectId, ref: 'Budget', required: true },
  createdBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:            { type: String, enum: ['income', 'expense'], required: true },
  amount:          { type: Number, required: true },
  description:     { type: String, default: '' },
  status:          { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  transactionDate: { type: Date, default: Date.now },
}, { timestamps: true })

module.exports = mongoose.model('Transaction', transactionSchema)
