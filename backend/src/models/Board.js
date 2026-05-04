const mongoose = require('mongoose')

const boardSchema = new mongoose.Schema({
  project:         { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title:           { type: String, required: true },
  backgroundColor: { type: String, default: '#0a1628' },
}, { timestamps: true })

module.exports = mongoose.model('Board', boardSchema)
