const Project = require('../models/Project')
const { success, error } = require('../utils/response')

// UC11: Lấy danh sách dự án
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }]
    }).populate('owner', 'name email avatarUrl')
    return success(res, projects)
  } catch (err) { next(err) }
}

// UC11: Xem chi tiết
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatarUrl')
      .populate('members.user', 'name email avatarUrl')
    if (!project) return error(res, 'Không tìm thấy dự án', 404)
    return success(res, project)
  } catch (err) { next(err) }
}

// UC11: Tạo dự án
const createProject = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate } = req.body
    const project = await Project.create({
      name, description, startDate, endDate,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'pm' }],
    })
    return success(res, project, 'Tạo dự án thành công', 201)
  } catch (err) { next(err) }
}

// UC11: Chỉnh sửa dự án
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!project) return error(res, 'Không tìm thấy dự án', 404)
    return success(res, project, 'Cập nhật dự án thành công')
  } catch (err) { next(err) }
}

// UC11: Xoá dự án
const deleteProject = async (req, res, next) => {
  try {
    await Project.findByIdAndDelete(req.params.id)
    return success(res, {}, 'Xoá dự án thành công')
  } catch (err) { next(err) }
}

// UC13: Thêm thành viên
const addMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body
    const project = await Project.findById(req.params.id)
    if (!project) return error(res, 'Không tìm thấy dự án', 404)

    const already = project.members.find(m => m.user.toString() === userId)
    if (already) return error(res, 'Thành viên đã có trong dự án', 400)

    project.members.push({ user: userId, role: role || 'member' })
    await project.save()
    return success(res, project, 'Thêm thành viên thành công')
  } catch (err) { next(err) }
}

// UC13: Xoá thành viên
const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return error(res, 'Không tìm thấy dự án', 404)

    project.members = project.members.filter(m => m.user.toString() !== req.params.userId)
    await project.save()
    return success(res, project, 'Xoá thành viên thành công')
  } catch (err) { next(err) }
}

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject, addMember, removeMember }
