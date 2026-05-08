const mongoose = require('mongoose')

const checklistItemSchema = new mongoose.Schema({
  text:      { type: String, required: true },
  completed: { type: Boolean, default: false },
}, { _id: true })

const attachmentSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  url:       { type: String, required: true },
  size:      { type: Number },
  mimeType:  { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
}, { _id: true })

const cardSchema = new mongoose.Schema({
  list:        { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  labelColor:  { type: String, default: 'blue' },
  tag:         { type: String, default: '' },
  dueDate:     { type: Date },
  priority:    { type: String, enum: ['urgent', 'high', 'medium', 'low'], default: 'medium' },
  status:      { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
  position:    { type: Number, default: 0 },
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  checklist:   [checklistItemSchema],
  attachments: [attachmentSchema],
  storyPoints: { type: Number, default: 0 },
  sprint:      { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint' },
}, { timestamps: true })

module.exports = mongoose.model('Card', cardSchema)
