const Project = require('../models/Project')
const Board   = require('../models/Board')
const List    = require('../models/List')
const Card    = require('../models/Card')
const { success, error } = require('../utils/response')

// UC12: Lấy dự án theo role
// Admin: tất cả | PM/TV: chỉ dự án mình tham gia
const getProjects = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin'
      ? {}
      : { $or: [{ owner: req.user._id }, { 'members.user': req.user._id }] }

    const projects = await Project.find(filter)
      .populate('owner', 'name email avatarUrl')
      .populate('members.user', 'name email avatarUrl')
      .sort({ createdAt: -1 })

    return success(res, projects)
  } catch (err) { next(err) }
}

// UC12: Xem chi tiết — kiểm tra quyền truy cập
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatarUrl')
      .populate('members.user', 'name email avatarUrl')

    if (!project) return error(res, 'Không tìm thấy dự án', 404)

    if (req.user.role !== 'admin') {
      const isMember = project.members.some(m => m.user._id?.toString() === req.user._id.toString())
      const isOwner  = project.owner._id?.toString() === req.user._id.toString()
      if (!isMember && !isOwner) return error(res, 'Bạn không có quyền xem dự án này', 403)
    }

    return success(res, project)
  } catch (err) { next(err) }
}

// UC11: Tạo dự án — PM hoặc Admin
const createProject = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate } = req.body
    if (!name?.trim()) return error(res, 'Tên dự án không được trống', 400)

    const project = await Project.create({
      name: name.trim(), description, startDate, endDate,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'pm' }],
      status: 'active',
    })

    const populated = await project.populate('owner', 'name email avatarUrl')
    return success(res, populated, 'Tạo dự án thành công', 201)
  } catch (err) { next(err) }
}

// UC11: Chỉnh sửa — PM/owner/admin
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return error(res, 'Không tìm thấy dự án', 404)

    if (req.user.role !== 'admin') {
      const member  = project.members.find(m => m.user.toString() === req.user._id.toString())
      const isOwner = project.owner.toString() === req.user._id.toString()
      if (!isOwner && member?.role !== 'pm')
        return error(res, 'Chỉ PM hoặc owner mới được chỉnh sửa dự án', 403)
    }

    const allowed = ['name', 'description', 'startDate', 'endDate', 'status']
    allowed.forEach(k => { if (req.body[k] !== undefined) project[k] = req.body[k] })
    await project.save()

    const populated = await project.populate([
      { path: 'owner', select: 'name email avatarUrl' },
      { path: 'members.user', select: 'name email avatarUrl' },
    ])
    return success(res, populated, 'Cập nhật dự án thành công')
  } catch (err) { next(err) }
}

// UC11: Xoá — chỉ Admin
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id)
    if (!project) return error(res, 'Không tìm thấy dự án', 404)
    return success(res, {}, 'Đã xoá dự án')
  } catch (err) { next(err) }
}

// UC13: Thêm thành viên — PM/owner/admin
const addMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body
    const project = await Project.findById(req.params.id)
    if (!project) return error(res, 'Không tìm thấy dự án', 404)

    if (req.user.role !== 'admin') {
      const member  = project.members.find(m => m.user.toString() === req.user._id.toString())
      const isOwner = project.owner.toString() === req.user._id.toString()
      if (!isOwner && member?.role !== 'pm')
        return error(res, 'Chỉ PM mới được thêm thành viên', 403)
    }

    const already = project.members.find(m => m.user.toString() === userId)
    if (already) return error(res, 'Thành viên đã có trong dự án', 400)

    project.members.push({ user: userId, role: role || 'member' })
    await project.save()

    const populated = await project.populate('members.user', 'name email avatarUrl')
    return success(res, populated, 'Thêm thành viên thành công')
  } catch (err) { next(err) }
}

// UC13: Xoá thành viên — PM/owner/admin
const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return error(res, 'Không tìm thấy dự án', 404)

    if (req.user.role !== 'admin') {
      const member  = project.members.find(m => m.user.toString() === req.user._id.toString())
      const isOwner = project.owner.toString() === req.user._id.toString()
      if (!isOwner && member?.role !== 'pm')
        return error(res, 'Chỉ PM mới được xoá thành viên', 403)
    }

    if (project.owner.toString() === req.params.userId)
      return error(res, 'Không thể xoá owner khỏi dự án', 400)

    project.members = project.members.filter(m => m.user.toString() !== req.params.userId)
    await project.save()
    return success(res, project, 'Xoá thành viên thành công')
  } catch (err) { next(err) }
}

// UC14: Tiến độ dự án
const getProjectProgress = async (req, res, next) => {
  try {
    const boards  = await Board.find({ project: req.params.id })
    const boardIds = boards.map(b => b._id)
    const lists   = await List.find({ board: { $in: boardIds } })
    const listIds  = lists.map(l => l._id)

    const total = await Card.countDocuments({ list: { $in: listIds } })
    const done  = await Card.countDocuments({ list: { $in: listIds }, status: 'done' })
    const pct   = total > 0 ? Math.round((done / total) * 100) : 0

    const byList = await Promise.all(lists.map(async l => ({
      title: l.title,
      count: await Card.countDocuments({ list: l._id }),
      done:  await Card.countDocuments({ list: l._id, status: 'done' }),
    })))

    return success(res, { total, done, percentage: pct, byList })
  } catch (err) { next(err) }
}

module.exports = {
  getProjects, getProject, createProject, updateProject,
  deleteProject, addMember, removeMember, getProjectProgress,
}
