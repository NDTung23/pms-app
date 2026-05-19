const Card    = require('../models/Card')
const List    = require('../models/List')
const Board   = require('../models/Board')
const Project = require('../models/Project')
const { success, error } = require('../utils/response')
const { createNotification } = require('../services/notification.service')
const { log } = require('./auditlog.controller')

async function checkCardAccess(cardId, userId, userRole) {
  const card = await Card.findById(cardId)
  if (!card) return { card: null, error: 'Không tìm thấy thẻ' }
  if (userRole === 'admin') return { card, error: null }
  const list    = await List.findById(card.list)
  const board   = await Board.findById(list?.board)
  const project = await Project.findById(board?.project)
  if (!project) return { card: null, error: 'Không tìm thấy dự án' }
  const isMember = project.members.some(m => m.user.toString() === userId.toString())
  const isOwner  = project.owner.toString() === userId.toString()
  if (!isMember && !isOwner) return { card: null, error: 'Bạn không phải thành viên dự án này' }
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
    if (req.user.role !== 'admin') {
      const list    = await List.findById(req.body.list)
      const board   = await Board.findById(list?.board)
      const project = await Project.findById(board?.project)
      if (!project) return error(res, 'Không tìm thấy dự án', 404)
      const isMember = project.members.some(m => m.user.toString() === req.user._id.toString())
      const isOwner  = project.owner.toString() === req.user._id.toString()
      if (!isMember && !isOwner) return error(res, 'Bạn không phải thành viên dự án này', 403)
    }

    const card = await Card.create(req.body)

    // Thông báo tạo card
    await createNotification({
      userId: req.user._id,
      type: card.dueDate ? 'deadline' : 'system',
      title: `Thẻ mới: ${card.title}`,
      body:  card.dueDate ? `Deadline: ${new Date(card.dueDate).toLocaleDateString('vi-VN')}` : 'Chưa có deadline',
      referenceId: card._id, referenceType: 'card',
    })

    // Audit log
    await log({ userId: req.user._id, action: 'create', resource: 'card', resourceId: card._id,
      detail: `Tạo thẻ: ${card.title}`, ip: req.ip })

    return success(res, card, 'Tạo thẻ thành công', 201)
  } catch (err) { next(err) }
}

const updateCard = async (req, res, next) => {
  try {
    const { card, error: err } = await checkCardAccess(req.params.id, req.user._id, req.user.role)
    if (err) return error(res, err, 404)

    // Lưu giá trị cũ để audit
    const oldTitle  = card.title
    const oldStatus = card.status

    const updated = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('members', 'name email avatarUrl')

    // Audit log khi cập nhật
    await log({ userId: req.user._id, action: 'update', resource: 'card', resourceId: card._id,
      detail: `Cập nhật thẻ: ${oldTitle}`,
      oldValue: { title: oldTitle, status: oldStatus },
      newValue: { title: updated.title, status: updated.status },
      ip: req.ip })

    return success(res, updated, 'Cập nhật thẻ thành công')
  } catch (err) { next(err) }
}

const deleteCard = async (req, res, next) => {
  try {
    const { card, error: err } = await checkCardAccess(req.params.id, req.user._id, req.user.role)
    if (err) return error(res, err, 404)

    await Card.findByIdAndDelete(req.params.id)

    await log({ userId: req.user._id, action: 'delete', resource: 'card', resourceId: req.params.id,
      detail: `Xoá thẻ: ${card.title}`, ip: req.ip })

    return success(res, {}, 'Xoá thẻ thành công')
  } catch (err) { next(err) }
}

// UC19: Kéo thả — ghi audit log đầy đủ
const moveCard = async (req, res, next) => {
  try {
    const { toListId } = req.body
    const card = await Card.findById(req.params.id)
    if (!card) return error(res, 'Không tìm thấy thẻ', 404)

    // Lấy tên list cũ và mới để log rõ ràng
    const [fromList, toList] = await Promise.all([
      List.findById(card.list),
      List.findById(toListId),
    ])

    const updated = await Card.findByIdAndUpdate(req.params.id, { list: toListId }, { new: true })

    // UC19: Ghi audit log khi kéo thả
    await log({
      userId:     req.user._id,
      action:     'move',
      resource:   'card',
      resourceId: card._id,
      detail:     `Di chuyển thẻ "${card.title}" từ cột "${fromList?.title || '?'}" sang "${toList?.title || '?'}"`,
      oldValue:   { list: card.list, listTitle: fromList?.title },
      newValue:   { list: toListId,  listTitle: toList?.title },
      ip:         req.ip,
    })

    return success(res, updated, 'Di chuyển thẻ thành công')
  } catch (err) { next(err) }
}

const assignMember = async (req, res, next) => {
  try {
    const { userId } = req.body
    const card = await Card.findByIdAndUpdate(
      req.params.id, { $addToSet: { members: userId } }, { new: true }
    ).populate('members', 'name email avatarUrl')
    if (!card) return error(res, 'Không tìm thấy thẻ', 404)

    await createNotification({
      userId, type: 'assigned',
      title: `Bạn được gán vào thẻ: ${card.title}`,
      body:  card.dueDate ? `Deadline: ${new Date(card.dueDate).toLocaleDateString('vi-VN')}` : 'Hãy kiểm tra thẻ.',
      referenceId: card._id, referenceType: 'card',
    })

    return success(res, card, 'Gán thành viên thành công')
  } catch (err) { next(err) }
}

const removeMember = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.id, { $pull: { members: req.params.userId } }, { new: true }
    ).populate('members', 'name email avatarUrl')
    if (!card) return error(res, 'Không tìm thấy thẻ', 404)
    return success(res, card, 'Xoá thành viên thành công')
  } catch (err) { next(err) }
}

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

module.exports = { getCards, createCard, updateCard, deleteCard, moveCard, assignMember, removeMember, updateChecklistItem }
