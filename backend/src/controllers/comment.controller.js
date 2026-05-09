const Comment  = require('../models/Comment')
const User     = require('../models/User')
const { createNotification } = require('../services/notification.service')
const { success, error } = require('../utils/response')

const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ card: req.params.cardId })
      .populate('user', 'name email avatarUrl')
      .populate('mentions', 'name email')
      .sort({ createdAt: 1 })
    return success(res, comments)
  } catch (err) { next(err) }
}

// UC24: Tạo comment với @mention
const createComment = async (req, res, next) => {
  try {
    const { content, mentions } = req.body
    if (!content?.trim()) return error(res, 'Nội dung không được trống', 400)

    // Tìm mentions từ @username trong content nếu không truyền mentions[]
    let mentionIds = mentions || []

    // Parse @mention từ content nếu có dạng @email hoặc @name
    const mentionMatches = content.match(/@[\w.+-]+/g) || []
    if (mentionMatches.length > 0 && mentionIds.length === 0) {
      const emails = mentionMatches.map(m => m.slice(1))
      const users  = await User.find({ email: { $in: emails } }).select('_id')
      mentionIds   = users.map(u => u._id)
    }

    const comment = await Comment.create({
      card:     req.params.cardId,
      user:     req.user._id,
      content:  content.trim(),
      mentions: mentionIds,
    })

    const populated = await comment.populate([
      { path: 'user',     select: 'name email avatarUrl' },
      { path: 'mentions', select: 'name email' },
    ])

    // UC24: Gửi thông báo cho người được @mention
    for (const uid of mentionIds) {
      if (uid.toString() !== req.user._id.toString()) {
        await createNotification({
          userId:        uid,
          type:          'comment',
          title:         `${req.user.name} đã tag bạn trong bình luận`,
          body:          content.slice(0, 80),
          referenceId:   req.params.cardId,
          referenceType: 'card',
        })
      }
    }

    return success(res, populated, 'Đã thêm bình luận', 201)
  } catch (err) { next(err) }
}

const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) return error(res, 'Không tìm thấy bình luận', 404)

    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return error(res, 'Không có quyền xoá bình luận này', 403)
    }

    await Comment.findByIdAndDelete(req.params.id)
    return success(res, {}, 'Đã xoá bình luận')
  } catch (err) { next(err) }
}

module.exports = { getComments, createComment, deleteComment }
