const Sprint  = require('../models/Sprint')
const Card    = require('../models/Card')
const List    = require('../models/List')
const Board   = require('../models/Board')
const { success, error } = require('../utils/response')

const getSprints = async (req, res, next) => {
  try {
    const sprints = await Sprint.find({ project: req.query.projectId }).sort({ createdAt: -1 })
    return success(res, sprints)
  } catch (err) { next(err) }
}

const createSprint = async (req, res, next) => {
  try {
    const { projectId, title, goal, startDate, endDate } = req.body
    const sprint = await Sprint.create({ project: projectId, title, goal, startDate, endDate })
    return success(res, sprint, 'Tạo sprint thành công', 201)
  } catch (err) { next(err) }
}

const updateSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!sprint) return error(res, 'Không tìm thấy sprint', 404)
    return success(res, sprint, 'Cập nhật sprint thành công')
  } catch (err) { next(err) }
}

// UC15: Đóng sprint — chuyển task chưa xong sang sprint tiếp theo
const closeSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id)
    if (!sprint) return error(res, 'Không tìm thấy sprint', 404)
    if (sprint.status === 'closed') return error(res, 'Sprint đã đóng rồi', 400)

    const { nextSprintId, moveUnfinished } = req.body

    // Nếu yêu cầu chuyển task chưa xong sang sprint tiếp
    if (moveUnfinished && nextSprintId) {
      const nextSprint = await Sprint.findById(nextSprintId)
      if (!nextSprint) return error(res, 'Không tìm thấy sprint tiếp theo', 404)

      // Tìm tất cả boards/lists của project này
      const boards  = await Board.find({ project: sprint.project })
      const boardIds = boards.map(b => b._id)
      const lists   = await List.find({ board: { $in: boardIds } })
      const listIds  = lists.map(l => l._id)

      // Tìm card thuộc sprint này và chưa done
      const unfinishedCards = await Card.find({
        list:   { $in: listIds },
        sprint: sprint._id,
        status: { $ne: 'done' },
      })

      // Chuyển sang sprint tiếp theo
      if (unfinishedCards.length > 0) {
        await Card.updateMany(
          { _id: { $in: unfinishedCards.map(c => c._id) } },
          { sprint: nextSprintId }
        )
      }

      sprint.status = 'closed'
      sprint.closedNote = `Đã chuyển ${unfinishedCards.length} task chưa hoàn thành sang sprint "${nextSprint.title}"`
      await sprint.save()

      return success(res, {
        sprint,
        movedCount: unfinishedCards.length,
        nextSprintId,
      }, `Đã đóng sprint và chuyển ${unfinishedCards.length} task chưa xong`)
    }

    // Đóng thông thường không chuyển task
    sprint.status = 'closed'
    await sprint.save()
    return success(res, sprint, 'Đã đóng sprint')
  } catch (err) { next(err) }
}

const getBurndown = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.sprintId)
    if (!sprint) return error(res, 'Không tìm thấy sprint', 404)

    const boards  = await Board.find({ project: sprint.project })
    const boardIds = boards.map(b => b._id)
    const lists   = await List.find({ board: { $in: boardIds } })
    const listIds  = lists.map(l => l._id)

    const cards = await Card.find({ list: { $in: listIds }, sprint: sprint._id })
    const totalCards = cards.length

    const start = new Date(sprint.startDate || sprint.createdAt)
    const end   = new Date(sprint.endDate   || new Date())
    const days  = []

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayStr   = d.toISOString().slice(0, 10)
      const doneByDay = cards.filter(c => c.status === 'done' && new Date(c.updatedAt) <= d).length
      const remaining = totalCards - doneByDay
      const elapsed   = (new Date(d) - start) / (end - start || 1)
      const ideal     = Math.round(Math.max(0, totalCards * (1 - elapsed)))
      days.push({ date: dayStr, remaining, ideal })
    }

    return success(res, { sprint, burndown: days, totalCards })
  } catch (err) { next(err) }
}

const getVelocity = async (req, res, next) => {
  try {
    const sprints = await Sprint.find({ project: req.params.projectId, status: 'closed' }).sort({ createdAt: 1 })
    const data = sprints.map(s => ({ sprint: s.title, velocity: s.velocity || 0, startDate: s.startDate, endDate: s.endDate }))
    return success(res, data)
  } catch (err) { next(err) }
}

module.exports = { getSprints, createSprint, updateSprint, closeSprint, getBurndown, getVelocity }
