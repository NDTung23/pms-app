const Card    = require('../models/Card')
const List    = require('../models/List')
const Board   = require('../models/Board')
const Project = require('../models/Project')
const { success, error } = require('../utils/response')
const { createNotification } = require('../services/notification.service')

// Helper: kiểm tra user có quyền truy cập card không
async function checkCardAccess(cardId, userId, userRole) {
  const card = await Card.findById(cardId)
  if (!card) return { card: null, error: 'Không tìm thấy thẻ' }

  if (userRole === 'admin') return { card, error: null }

  const list  = await List.findById(card.list)
  const board = await Board.findById(list?.board)
  const project = await Project.findById(board?.project)

  if (!project) return { card: null, error: 'Không tìm thấy dự án' }

  const isMember = project.members.some(m => m.user.toString() === userId.toString())
  const isOwner  = project.owner.toString() === userId.toString()

  if (!isMember && !isOwner) {
    return { card: null, error: 'Bạn không phải thành viên dự án này' }
  }

  return { card, project, error: null }
}

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
    // Kiểm tra user có trong project không
    if (req.user.role !== 'admin') {
      const list  = await List.findById(req.body.list)
      const board = await Board.findById(list?.board)
      const project = await Project.findById(board?.project)

      if (!project) return error(res, 'Không tìm thấy dự án', 404)

      const isMember = project.members.some(m => m.user.toString() === req.user._id.toString())
      const isOwner  = project.owner.toString() === req.user._id.toString()

      if (!isMember && !isOwner) {
        return error(res, 'Bạn không phải thành viên dự án này', 403)
      }
    }

    const card = await Card.create(req.body)

    // Thông báo UC22
    await createNotification({
      userId:        req.user._id,
      type:          card.dueDate ? 'deadline' : 'system',
      title:         `Thẻ mới: ${card.title}`,
      body:          card.dueDate ? `Deadline: ${new Date(card.dueDate).toLocaleDateString('vi-VN')}` : 'Chưa có deadline',
      referenceId:   card._id,
      referenceType: 'card',
    })

    return success(res, card, 'Tạo thẻ thành công', 201)
  } catch (err) { next(err) }
}

const updateCard = async (req, res, next) => {
  try {
    const { card, error: err } = await checkCardAccess(req.params.id, req.user._id, req.user.role)
    if (err) return error(res, err, 404)

    const updated = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('members', 'name email avatarUrl')

    return success(res, updated, 'Cập nhật thẻ thành công')
  } catch (err) { next(err) }
}

const deleteCard = async (req, res, next) => {
  try {
    const { error: err } = await checkCardAccess(req.params.id, req.user._id, req.user.role)
    if (err) return error(res, err, 404)

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

// UC20: Gán thành viên — gửi thông báo UC22
const assignMember = async (req, res, next) => {
  try {
    const { userId } = req.body
    const card = await Card.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: userId } },
      { new: true }
    ).populate('members', 'name email avatarUrl')

    if (!card) return error(res, 'Không tìm thấy thẻ', 404)

    // Thông báo cho người được gán
    await createNotification({
      userId,
      type:          'assigned',
      title:         `Bạn được gán vào thẻ: ${card.title}`,
      body:          card.dueDate ? `Deadline: ${new Date(card.dueDate).toLocaleDateString('vi-VN')}` : 'Hãy kiểm tra thẻ.',
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
    if (!card) return error(res, 'Không tìm thấy thẻ', 404)
    return success(res, card, 'Xoá thành viên thành công')
  } catch (err) { next(err) }
}

// UC21: Cập nhật checklist item
const updateChecklistItem = async (req, res, next) => {
  try {
    const { itemId } = req.params
    const { completed } = req.body
    const card = await Card.findOneAndUpdate(
      { _id: req.params.id, 'checklist._id': itemId },
      { $set: { 'checklist.$.completed': completed } },
      { new: true }
    )
    if (!card) return error(res, 'Không tìm thấy thẻ hoặc mục', 404)
    return success(res, card, 'Cập nhật checklist thành công')
  } catch (err) { next(err) }
}

module.exports = {
  getCards, createCard, updateCard, deleteCard,
  moveCard, assignMember, removeMember, updateChecklistItem,
}
