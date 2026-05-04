const Card    = require('../models/Card')
const List    = require('../models/List')
const Board   = require('../models/Board')
const Project = require('../models/Project')
const { success } = require('../utils/response')

// UC31: Tổng quan dashboard
const getOverview = async (req, res, next) => {
  try {
    const userId   = req.user._id
    const projects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }]
    })
    const projectIds = projects.map(p => p._id)
    const boards     = await Board.find({ project: { $in: projectIds } })
    const boardIds   = boards.map(b => b._id)
    const lists      = await List.find({ board: { $in: boardIds } })
    const listIds    = lists.map(l => l._id)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [totalCards, overdueCards, urgentCards] = await Promise.all([
      Card.countDocuments({ list: { $in: listIds } }),
      Card.countDocuments({ list: { $in: listIds }, dueDate: { $lt: today } }),
      Card.countDocuments({ list: { $in: listIds }, priority: 'urgent' }),
    ])

    return success(res, {
      totalProjects: projects.length,
      totalCards, overdueCards, urgentCards, doneCards: 0,
    })
  } catch (err) { next(err) }
}

// UC32: Thống kê task
const getTaskStats = async (req, res, next) => {
  try {
    const userId   = req.user._id
    const projects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }]
    })
    const projectIds = projects.map(p => p._id)
    const boards     = await Board.find({ project: { $in: projectIds } })
    const boardIds   = boards.map(b => b._id)
    const lists      = await List.find({ board: { $in: boardIds } })
    const listIds    = lists.map(l => l._id)

    const byPriority = await Card.aggregate([
      { $match: { list: { $in: listIds } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ])

    const byList = await Promise.all(
      lists.map(async list => ({
        name:  list.title,
        count: await Card.countDocuments({ list: list._id }),
      }))
    )

    return success(res, { byPriority, byList })
  } catch (err) { next(err) }
}

// UC28: Ngân sách
const getBudgetReport = async (req, res, next) => {
  try {
    return success(res, { planned: 0, actual: 0, currency: 'VND' })
  } catch (err) { next(err) }
}

// Planner: Cards có deadline
const getPlannerCards = async (req, res, next) => {
  try {
    const userId   = req.user._id
    const projects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }]
    })
    const projectIds = projects.map(p => p._id)
    const boards     = await Board.find({ project: { $in: projectIds } })
    const boardIds   = boards.map(b => b._id)
    const lists      = await List.find({ board: { $in: boardIds } })
    const listIds    = lists.map(l => l._id)

    const cards = await Card.find({
      list:    { $in: listIds },
      dueDate: { $exists: true, $ne: null },
    })
    .populate('list', 'title')
    .sort({ dueDate: 1 })

    return success(res, cards)
  } catch (err) { next(err) }
}

module.exports = { getOverview, getTaskStats, getBudgetReport, getPlannerCards }
