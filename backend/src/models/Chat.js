const mongoose = require('mongoose')

const chatChannelSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  name:    { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

const chatMessageSchema = new mongoose.Schema({
  channel: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatChannel', required: true },
  sender:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  fileUrl: { type: String },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

const ChatChannel = mongoose.model('ChatChannel', chatChannelSchema)
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema)

module.exports = { ChatChannel, ChatMessage }
