const Card    = require('../models/Card')
const List    = require('../models/List')
const Board   = require('../models/Board')
const Project = require('../models/Project')
const mongoose = require('mongoose')
const { success } = require('../utils/response')

// Helper: lấy listIds thuộc các project của user
// Admin thấy tất cả, PM/TV chỉ thấy project mình tham gia
async function getListIds(userId, userRole) {
  // Lọc project theo role
  const projectFilter = userRole === 'admin'
    ? {}  // Admin thấy tất cả project
    : { $or: [{ owner: userId }, { 'members.user': userId }] }

  const projects   = await Project.find(projectFilter)
  const projectIds = projects.map(p => p._id)
  const boards     = await Board.find({ project: { $in: projectIds } })
  const boardIds   = boards.map(b => b._id)
  const lists      = await List.find({ board: { $in: boardIds } })

  // Đảm bảo listIds là mảng ObjectId hợp lệ cho cả query và aggregate
  const listIds = lists.map(l => new mongoose.Types.ObjectId(l._id.toString()))

  return { projects, lists, listIds }
}

// UC31: Tổng quan dashboard
const getOverview = async (req, res, next) => {
  try {
    const { projects, listIds } = await getListIds(req.user._id, req.user.role)

    // Nếu không có list nào thì trả về 0 hết
    if (listIds.length === 0) {
      return success(res, {
        totalProjects: projects.length,
        totalCards: 0, overdueCards: 0, urgentCards: 0, doneCards: 0,
      })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

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
    const { lists, listIds } = await getListIds(req.user._id, req.user.role)

    // Nếu không có list → trả về rỗng
    if (listIds.length === 0) {
      return success(res, { byPriority: [], byList: [], byMember: [] })
    }

    const byPriority = await Card.aggregate([
      { $match: { list: { $in: listIds } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    // Thống kê theo thành viên
    const byMember = await Card.aggregate([
      { $match: { list: { $in: listIds }, members: { $exists: true, $ne: [] } } },
      { $unwind: '$members' },
      { $group: { _id: '$members', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $project: { count: 1, name: '$user.name', email: '$user.email' } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    // Thống kê theo cột (dùng countDocuments thay aggregate để tránh type mismatch)
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
    if (!projectId) return success(res, { total: 0, done: 0, percentage: 0, byList: [] })

    const boards  = await Board.find({ project: projectId })
    const boardIds = boards.map(b => b._id)
    const lists   = await List.find({ board: { $in: boardIds } })
    const listIds  = lists.map(l => l._id)

    if (listIds.length === 0) {
      return success(res, { total: 0, done: 0, percentage: 0, byList: [] })
    }

    const [total, done] = await Promise.all([
      Card.countDocuments({ list: { $in: listIds } }),
      Card.countDocuments({ list: { $in: listIds }, status: 'done' }),
    ])
    const pct = total > 0 ? Math.round((done / total) * 100) : 0

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
    const { listIds } = await getListIds(req.user._id, req.user.role)

    if (listIds.length === 0) return success(res, [])

    const cards = await Card.find({
      list:    { $in: listIds },
      dueDate: { $exists: true, $ne: null },
    })
    .populate('list', 'title')
    .populate('members', 'name email avatarUrl')
    .sort({ dueDate: 1 })

    return success(res, cards)
  } catch (err) { next(err) }
}

module.exports = { getOverview, getTaskStats, getBudgetReport, getPlannerCards, getProjectProgress }
