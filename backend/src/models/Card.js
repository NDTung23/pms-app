const mongoose = require('mongoose')

const cardSchema = new mongoose.Schema({
  list:        { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
  sprint:      { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint' },
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  labelColor:  { type: String, default: 'blue' },
  priority:    { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  dueDate:     { type: Date },
  position:    { type: Number, default: 0 },
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  attachments: [{
    fileName: String,
    fileUrl:  String,
    fileType: String,
    fileSize: Number,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
  }],
  checklists: [{
    title: String,
    items: [{
      content:   String,
      isDone:    { type: Boolean, default: false },
      updatedAt: { type: Date, default: Date.now },
    }],
  }],
}, { timestamps: true })

module.exports = mongoose.model('Card', cardSchema)
