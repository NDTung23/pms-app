const Card = require('../models/Card')
const { success, error } = require('../utils/response')
const { createNotification } = require('../services/notification.service')

const getCards = async (req, res, next) => {
  try {
    const cards = await Card.find({ list: req.query.listId })
      .populate('members', 'name email avatarUrl')
      .sort('position')
    return success(res, cards)
  } catch (err) { next(err) }
}

const createCard = async (req, res, next) => {
  try {
    const card = await Card.create(req.body)

    // Tạo thông báo cho tất cả thẻ mới
    await createNotification({
      userId:        req.user._id,
      type:          card.dueDate ? 'deadline' : 'system',
      title:         `Thẻ mới được tạo: ${card.title}`,
      body:          card.dueDate
        ? `Deadline: ${new Date(card.dueDate).toLocaleDateString('vi-VN')}`
        : 'Chưa có deadline',
      referenceId:   card._id,
      referenceType: 'card',
    })

    return success(res, card, 'Tạo thẻ thành công', 201)
  } catch (err) { next(err) }
}

const updateCard = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('members', 'name email avatarUrl')
    if (!card) return error(res, 'Không tìm thấy thẻ', 404)
    return success(res, card, 'Cập nhật thẻ thành công')
  } catch (err) { next(err) }
}

const deleteCard = async (req, res, next) => {
  try {
    await Card.findByIdAndDelete(req.params.id)
    return success(res, {}, 'Xoá thẻ thành công')
  } catch (err) { next(err) }
}

const moveCard = async (req, res, next) => {
  try {
    const { toListId } = req.body
    const card = await Card.findByIdAndUpdate(req.params.id, { list: toListId }, { new: true })
    if (!card) return error(res, 'Không tìm thấy thẻ', 404)
    return success(res, card, 'Di chuyển thẻ thành công')
  } catch (err) { next(err) }
}

const assignMember = async (req, res, next) => {
  try {
    const { userId } = req.body
    const card = await Card.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: userId } },
      { new: true }
    ).populate('members', 'name email avatarUrl')

    await createNotification({
      userId,
      type:          'assigned',
      title:         `Bạn được gán vào thẻ: ${card.title}`,
      body:          `Hãy kiểm tra thẻ và cập nhật tiến độ.`,
      referenceId:   card._id,
      referenceType: 'card',
    })

    return success(res, card, 'Gán thành viên thành công')
  } catch (err) { next(err) }
}

const removeMember = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: req.params.userId } },
      { new: true }
    ).populate('members', 'name email avatarUrl')
    return success(res, card, 'Xoá thành viên thành công')
  } catch (err) { next(err) }
}

module.exports = { getCards, createCard, updateCard, deleteCard, moveCard, assignMember, removeMember }
