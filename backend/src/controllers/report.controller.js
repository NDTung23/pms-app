const Card    = require('../models/Card')
const List    = require('../models/List')
const Board   = require('../models/Board')
const Project = require('../models/Project')
const { success } = require('../utils/response')

// Helper: lấy listIds thuộc các project của user
async function getListIds(userId) {
  const projects = await Project.find({
    $or: [{ owner: userId }, { 'members.user': userId }]
  })
  const projectIds = projects.map(p => p._id)
  const boards     = await Board.find({ project: { $in: projectIds } })
  const boardIds   = boards.map(b => b._id)
  const lists      = await List.find({ board: { $in: boardIds } })
  return { projects, lists, listIds: lists.map(l => l._id) }
}

// UC31: Tổng quan dashboard
const getOverview = async (req, res, next) => {
  try {
    const { projects, listIds } = await getListIds(req.user._id)
    const today = new Date(); today.setHours(0, 0, 0, 0)

    const [totalCards, overdueCards, urgentCards, doneCards] = await Promise.all([
      Card.countDocuments({ list: { $in: listIds } }),
      Card.countDocuments({ list: { $in: listIds }, dueDate: { $lt: today } }),
      Card.countDocuments({ list: { $in: listIds }, priority: 'urgent' }),
      Card.countDocuments({ list: { $in: listIds }, status: 'done' }),
    ])

    return success(res, {
      totalProjects: projects.length,
      totalCards, overdueCards, urgentCards, doneCards,
    })
  } catch (err) { next(err) }
}

// UC32 + UC33: Thống kê task theo cột và priority
const getTaskStats = async (req, res, next) => {
  try {
    const { lists, listIds } = await getListIds(req.user._id)

    const byPriority = await Card.aggregate([
      { $match: { list: { $in: listIds } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ])

    // Thống kê theo thành viên
    const byMember = await Card.aggregate([
      { $match: { list: { $in: listIds }, members: { $exists: true, $ne: [] } } },
      { $unwind: '$members' },
      { $group: { _id: '$members', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmpty: true } },
      { $project: { count: 1, name: '$user.name', email: '$user.email' } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    const byList = await Promise.all(
      lists.map(async list => ({
        name:  list.title,
        count: await Card.countDocuments({ list: list._id }),
      }))
    )

    return success(res, { byPriority, byList, byMember })
  } catch (err) { next(err) }
}

// UC14: Tiến độ dự án (% task done)
const getProjectProgress = async (req, res, next) => {
  try {
    const { projectId } = req.query
    const boards  = await Board.find({ project: projectId })
    const boardIds = boards.map(b => b._id)
    const lists   = await List.find({ board: { $in: boardIds } })
    const listIds  = lists.map(l => l._id)

    const total = await Card.countDocuments({ list: { $in: listIds } })
    const done  = await Card.countDocuments({ list: { $in: listIds }, status: 'done' })
    const pct   = total > 0 ? Math.round((done / total) * 100) : 0

    // Thống kê theo cột
    const byList = await Promise.all(lists.map(async l => ({
      title: l.title,
      count: await Card.countDocuments({ list: l._id }),
      done:  await Card.countDocuments({ list: l._id, status: 'done' }),
    })))

    return success(res, { total, done, percentage: pct, byList })
  } catch (err) { next(err) }
}

// UC28: Ngân sách
const getBudgetReport = async (req, res, next) => {
  try {
    return success(res, { planned: 0, actual: 0, currency: 'VND' })
  } catch (err) { next(err) }
}

// UC31: Planner cards có deadline
const getPlannerCards = async (req, res, next) => {
  try {
    const { listIds } = await getListIds(req.user._id)
    const cards = await Card.find({
      list: { $in: listIds },
      dueDate: { $exists: true, $ne: null },
    })
    .populate('list', 'title')
    .populate('members', 'name email avatarUrl')
    .sort({ dueDate: 1 })

    return success(res, cards)
  } catch (err) { next(err) }
}

module.exports = { getOverview, getTaskStats, getBudgetReport, getPlannerCards, getProjectProgress }
