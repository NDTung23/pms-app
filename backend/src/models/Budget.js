const mongoose = require('mongoose')

const budgetSchema = new mongoose.Schema({
  project:    { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  totalAmount: { type: Number, default: 0 },
  currency:   { type: String, default: 'VND' },
  categories: [{
    name:   { type: String, required: true },
    amount: { type: Number, default: 0 },
  }],
  alertSent80:  { type: Boolean, default: false },
  alertSent100: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Budget', budgetSchema)
