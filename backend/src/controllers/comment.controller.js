const Comment = require('../models/Comment')
const { success, error } = require('../utils/response')

// Lấy comments theo card
const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ card: req.params.cardId })
      .populate('user', 'name email avatarUrl')
      .sort({ createdAt: 1 })
    return success(res, comments)
  } catch (err) { next(err) }
}

// Thêm comment
const createComment = async (req, res, next) => {
  try {
    const { content } = req.body
    if (!content?.trim()) return error(res, 'Nội dung không được trống', 400)

    const comment = await Comment.create({
      card:    req.params.cardId,
      user:    req.user._id,
      content: content.trim(),
    })

    const populated = await comment.populate('user', 'name email avatarUrl')
    return success(res, populated, 'Đã thêm bình luận', 201)
  } catch (err) { next(err) }
}

// Xoá comment
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) return error(res, 'Không tìm thấy bình luận', 404)

    // Chỉ người tạo mới được xoá
    if (comment.user.toString() !== req.user._id.toString()) {
      return error(res, 'Không có quyền xoá bình luận này', 403)
    }

    await Comment.findByIdAndDelete(req.params.id)
    return success(res, {}, 'Đã xoá bình luận')
  } catch (err) { next(err) }
}

module.exports = { getComments, createComment, deleteComment }
