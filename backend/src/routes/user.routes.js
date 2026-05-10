const express    = require('express')
const router     = express.Router()
const User       = require('../models/User')
const AuditLog   = require('../models/AuditLog')
const { protect }   = require('../middlewares/auth.middleware')
const { authorize } = require('../middlewares/role.middleware')
const { success, error } = require('../utils/response')

router.use(protect)

router.get('/search', async (req, res, next) => {
  try {
    const { email } = req.query
    if (!email) return error(res, 'Vui lòng nhập email', 400)
    const user = await User.findOne({ email: email.toLowerCase() }).select('-password')
    if (!user) return error(res, 'Không tìm thấy người dùng', 404)
    return success(res, user)
  } catch (err) { next(err) }
})

router.get('/', authorize('admin','pm'), async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    return success(res, users)
  } catch (err) { next(err) }
})

// UC9: Lịch sử hoạt động
router.get('/:id/activity', authorize('admin','pm'), async (req, res, next) => {
  try {
    const logs = await AuditLog.find({ user: req.params.id }).sort({ createdAt: -1 }).limit(50)
    return success(res, logs)
  } catch (err) { next(err) }
})

router.patch('/:id/role', authorize('admin'), async (req, res, next) => {
  try {
    const { role } = req.body
    if (!['admin','pm','member'].includes(role)) return error(res, 'Role không hợp lệ', 400)
    if (req.params.id === req.user._id.toString()) return error(res, 'Không thể đổi role của chính mình', 400)
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password')
    if (!user) return error(res, 'Không tìm thấy người dùng', 404)
    return success(res, user, 'Đổi role thành công')
  } catch (err) { next(err) }
})

router.patch('/:id/toggle-active', authorize('admin'), async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) return error(res, 'Không thể khoá chính mình', 400)
    const user = await User.findById(req.params.id)
    if (!user) return error(res, 'Không tìm thấy người dùng', 404)
    user.isActive = !user.isActive
    await user.save()
    return success(res, { _id: user._id, isActive: user.isActive },
      user.isActive ? 'Đã mở khoá tài khoản' : 'Đã khoá tài khoản')
  } catch (err) { next(err) }
})

router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) return error(res, 'Không thể xoá chính mình', 400)
    await User.findByIdAndDelete(req.params.id)
    return success(res, {}, 'Đã xoá người dùng')
  } catch (err) { next(err) }
})

module.exports = router
