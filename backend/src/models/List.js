const mongoose = require('mongoose')

const listSchema = new mongoose.Schema({
  board:    { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  title:    { type: String, required: true },
  position: { type: Number, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model('List', listSchema)
