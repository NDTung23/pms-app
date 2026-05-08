const Sprint  = require('../models/Sprint')
const Card    = require('../models/Card')
const List    = require('../models/List')
const Board   = require('../models/Board')
const { success, error } = require('../utils/response')

// UC15: Lấy sprints theo project
const getSprints = async (req, res, next) => {
  try {
    const sprints = await Sprint.find({ project: req.query.projectId }).sort({ createdAt: -1 })
    return success(res, sprints)
  } catch (err) { next(err) }
}

// UC15: Tạo sprint
const createSprint = async (req, res, next) => {
  try {
    const { projectId, title, goal, startDate, endDate } = req.body
    const sprint = await Sprint.create({ project: projectId, title, goal, startDate, endDate })
    return success(res, sprint, 'Tạo sprint thành công', 201)
  } catch (err) { next(err) }
}

// UC15: Cập nhật sprint
const updateSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!sprint) return error(res, 'Không tìm thấy sprint', 404)
    return success(res, sprint, 'Cập nhật sprint thành công')
  } catch (err) { next(err) }
}

// UC15: Đóng sprint
const closeSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findByIdAndUpdate(
      req.params.id,
      { status: 'closed' },
      { new: true }
    )
    if (!sprint) return error(res, 'Không tìm thấy sprint', 404)
    return success(res, sprint, 'Đã đóng sprint')
  } catch (err) { next(err) }
}

// UC16: Burndown chart data
const getBurndown = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.sprintId)
    if (!sprint) return error(res, 'Không tìm thấy sprint', 404)

    const boards = await Board.find({ project: sprint.project })
    const boardIds = boards.map(b => b._id)
    const lists = await List.find({ board: { $in: boardIds } })
    const listIds = lists.map(l => l._id)

    const cards = await Card.find({
      list: { $in: listIds },
      createdAt: { $lte: sprint.endDate || new Date() }
    })

    // Tạo dữ liệu burndown đơn giản: mỗi ngày trong sprint
    const start = new Date(sprint.startDate || sprint.createdAt)
    const end   = new Date(sprint.endDate || new Date())
    const days  = []
    const totalCards = cards.length

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayStr = d.toISOString().slice(0, 10)
      // Cards chưa xong tính đến ngày đó (giả lập: dùng updatedAt)
      const remaining = cards.filter(c => {
        const updated = new Date(c.updatedAt)
        return updated > d || c.priority !== 'low'
      }).length
      days.push({ date: dayStr, remaining, ideal: Math.max(0, totalCards - Math.floor((new Date(d) - start) / (end - start) * totalCards)) })
    }

    return success(res, { sprint, burndown: days, totalCards })
  } catch (err) { next(err) }
}

// UC16: Velocity chart data
const getVelocity = async (req, res, next) => {
  try {
    const sprints = await Sprint.find({ project: req.params.projectId, status: 'closed' }).sort({ createdAt: 1 })
    const data = sprints.map(s => ({ sprint: s.title, velocity: s.velocity || 0, startDate: s.startDate, endDate: s.endDate }))
    return success(res, data)
  } catch (err) { next(err) }
}

module.exports = { getSprints, createSprint, updateSprint, closeSprint, getBurndown, getVelocity }
