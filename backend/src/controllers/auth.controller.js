const User = require('../models/User')
const { hashPassword, comparePassword } = require('../utils/hash')
const { generateToken } = require('../utils/jwt')
const { success, error } = require('../utils/response')

// UC1: Đăng ký
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return error(res, 'Vui lòng điền đầy đủ thông tin', 400)

    const exists = await User.findOne({ email })
    if (exists) return error(res, 'Email đã được sử dụng', 400)

    const hashed = await hashPassword(password)
    const user   = await User.create({ name, email, password: hashed })
    const token  = generateToken(user._id)

    return success(res, { token, user: { _id: user._id, name, email, role: user.role } }, 'Đăng ký thành công', 201)
  } catch (err) { next(err) }
}

// UC2: Đăng nhập
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return error(res, 'Vui lòng nhập email và mật khẩu', 400)

    const user = await User.findOne({ email })
    if (!user) return error(res, 'Email hoặc mật khẩu không đúng', 401)
    if (!user.isActive) return error(res, 'Tài khoản đã bị khoá', 403)

    const match = await comparePassword(password, user.password)
    if (!match) return error(res, 'Email hoặc mật khẩu không đúng', 401)

    user.lastLogin = new Date()
    await user.save()

    const token = generateToken(user._id)
    return success(res, { token, user: { _id: user._id, name: user.name, email, role: user.role } }, 'Đăng nhập thành công')
  } catch (err) { next(err) }
}

// UC3: Đăng xuất (client xoá token, server ghi nhận)
const logout = async (req, res) => {
  return success(res, {}, 'Đăng xuất thành công')
}

// Lấy thông tin user hiện tại
const getMe = async (req, res) => {
  return success(res, req.user)
}

// UC5: Đổi mật khẩu
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user._id)

    const match = await comparePassword(oldPassword, user.password)
    if (!match) return error(res, 'Mật khẩu cũ không đúng', 400)

    user.password = await hashPassword(newPassword)
    await user.save()
    return success(res, {}, 'Đổi mật khẩu thành công')
  } catch (err) { next(err) }
}

// UC7: Cập nhật hồ sơ
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatarUrl } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatarUrl },
      { new: true, runValidators: true }
    ).select('-password')
    return success(res, user, 'Cập nhật thông tin thành công')
  } catch (err) { next(err) }
}

module.exports = { register, login, logout, getMe, changePassword, updateProfile }
