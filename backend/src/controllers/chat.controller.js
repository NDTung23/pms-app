const { ChatChannel, ChatMessage } = require('../models/Chat')
const { success, error } = require('../utils/response')

// Lấy channels theo project
const getChannels = async (req, res, next) => {
  try {
    const channels = await ChatChannel.find({ project: req.query.projectId })
      .populate('members', 'name email avatarUrl')
    return success(res, channels)
  } catch (err) { next(err) }
}

// Tạo channel
const createChannel = async (req, res, next) => {
  try {
    const { projectId, name, members } = req.body
    const channel = await ChatChannel.create({
      project: projectId, name,
      members: members || [req.user._id],
    })
    return success(res, channel, 'Tạo kênh thành công', 201)
  } catch (err) { next(err) }
}

// Xoá channel
const deleteChannel = async (req, res, next) => {
  try {
    await ChatChannel.findByIdAndDelete(req.params.id)
    await ChatMessage.deleteMany({ channel: req.params.id })
    return success(res, {}, 'Đã xoá kênh')
  } catch (err) { next(err) }
}

// Lấy messages theo channel
const getMessages = async (req, res, next) => {
  try {
    const messages = await ChatMessage.find({ channel: req.params.channelId })
      .populate('sender', 'name email avatarUrl')
      .populate('mentions', 'name email')
      .sort({ createdAt: 1 })
      .limit(100)
    return success(res, messages)
  } catch (err) { next(err) }
}

// Gửi message
const sendMessage = async (req, res, next) => {
  try {
    const { content, mentions } = req.body
    if (!content?.trim()) return error(res, 'Nội dung không được trống', 400)

    const message = await ChatMessage.create({
      channel:  req.params.channelId,
      sender:   req.user._id,
      content:  content.trim(),
      mentions: mentions || [],
    })
    const populated = await message.populate([
      { path: 'sender', select: 'name email avatarUrl' },
      { path: 'mentions', select: 'name email' },
    ])
    return success(res, populated, 'Đã gửi', 201)
  } catch (err) { next(err) }
}

// Xoá message
const deleteMessage = async (req, res, next) => {
  try {
    const msg = await ChatMessage.findById(req.params.id)
    if (!msg) return error(res, 'Không tìm thấy tin nhắn', 404)
    if (msg.sender.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return error(res, 'Không có quyền xoá', 403)
    }
    await ChatMessage.findByIdAndDelete(req.params.id)
    return success(res, {}, 'Đã xoá tin nhắn')
  } catch (err) { next(err) }
}

module.exports = { getChannels, createChannel, deleteChannel, getMessages, sendMessage, deleteMessage }
