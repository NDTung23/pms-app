const { error } = require('../utils/response')
const Project   = require('../models/Project')

// Kiểm tra role hệ thống (admin/pm/member)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return error(res, `Bạn không có quyền thực hiện thao tác này`, 403)
    }
    next()
  }
}

// Kiểm tra user có phải PM hoặc owner của project không
const isProjectPM = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.body.projectId || req.query.projectId
    if (!projectId) return next()

    const project = await Project.findById(projectId)
    if (!project) return error(res, 'Không tìm thấy dự án', 404)

    // Admin luôn có quyền
    if (req.user.role === 'admin') return next()

    // Kiểm tra là owner hoặc PM trong project
    const member = project.members.find(
      m => m.user.toString() === req.user._id.toString()
    )

    if (!member || (member.role !== 'pm' && project.owner.toString() !== req.user._id.toString())) {
      return error(res, 'Chỉ PM mới có quyền thực hiện thao tác này', 403)
    }

    req.project = project
    next()
  } catch (err) { next(err) }
}

// Kiểm tra user có trong project không
const isProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId || req.query.projectId
    if (!projectId) return next()

    const project = await Project.findById(projectId)
    if (!project) return error(res, 'Không tìm thấy dự án', 404)

    if (req.user.role === 'admin') return next()

    const isMember = project.members.some(
      m => m.user.toString() === req.user._id.toString()
    ) || project.owner.toString() === req.user._id.toString()

    if (!isMember) return error(res, 'Bạn không phải thành viên của dự án này', 403)

    req.project = project
    next()
  } catch (err) { next(err) }
}

module.exports = { authorize, isProjectPM, isProjectMember }
