const crypto = require('crypto')
const User = require('../models/User')
const { hashPassword, comparePassword } = require('../utils/hash')
const { generateToken } = require('../utils/jwt')
const { success, error } = require('../utils/response')

// In-memory store cho reset tokens (production nên dùng Redis hoặc DB)
const resetTokens = new Map() // token -> { userId, expires }

// UC1: Đăng ký
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return error(res, 'Vui lòng điền đầy đủ thông tin', 400)
    if (password.length < 6)
      return error(res, 'Mật khẩu phải có ít nhất 6 ký tự', 400)

    const exists = await User.findOne({ email: email.toLowerCase() })
    if (exists) return error(res, 'Email đã được sử dụng', 400)

    const hashed = await hashPassword(password)
    const user   = await User.create({ name, email: email.toLowerCase(), password: hashed })
    const token  = generateToken(user._id)

    return success(res, { token, user: { _id: user._id, name, email: user.email, role: user.role } }, 'Đăng ký thành công', 201)
  } catch (err) { next(err) }
}

// UC2: Đăng nhập
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return error(res, 'Vui lòng nhập email và mật khẩu', 400)

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return error(res, 'Email hoặc mật khẩu không đúng', 401)
    if (!user.isActive) return error(res, 'Tài khoản đã bị khoá', 403)

    const match = await comparePassword(password, user.password)
    if (!match) return error(res, 'Email hoặc mật khẩu không đúng', 401)

    user.lastLogin = new Date()
    await user.save()

    const token = generateToken(user._id)
    return success(res, {
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl }
    }, 'Đăng nhập thành công')
  } catch (err) { next(err) }
}

// UC3: Đăng xuất
const logout = async (req, res) => {
  return success(res, {}, 'Đăng xuất thành công')
}

// Lấy thông tin user hiện tại
const getMe = async (req, res) => {
  return success(res, req.user)
}

// UC4: Quên mật khẩu - tạo token reset
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) return error(res, 'Vui lòng nhập email', 400)

    const user = await User.findOne({ email: email.toLowerCase() })
    // Luôn trả về thành công để tránh lộ email tồn tại
    if (!user) return success(res, {}, 'Nếu email tồn tại, link đặt lại đã được gửi')

    // Tạo token ngẫu nhiên
    const token   = crypto.randomBytes(32).toString('hex')
    const expires = Date.now() + 30 * 60 * 1000 // 30 phút
    resetTokens.set(token, { userId: user._id.toString(), expires })

    // Production: gửi email. Dev: trả token trong response
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`
    console.log(`[DEV] Reset URL cho ${email}: ${resetUrl}`)

    return success(res, {
      message: 'Link đặt lại mật khẩu đã được gửi',
      // Chỉ trả về trong dev để test
      ...(process.env.NODE_ENV === 'development' && { resetUrl, token })
    }, 'Đã gửi link đặt lại mật khẩu')
  } catch (err) { next(err) }
}

// UC4: Đặt lại mật khẩu bằng token
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body
    if (!token || !password) return error(res, 'Thiếu thông tin', 400)
    if (password.length < 6) return error(res, 'Mật khẩu phải có ít nhất 6 ký tự', 400)

    const record = resetTokens.get(token)
    if (!record) return error(res, 'Token không hợp lệ hoặc đã hết hạn', 400)
    if (Date.now() > record.expires) {
      resetTokens.delete(token)
      return error(res, 'Token đã hết hạn (30 phút)', 400)
    }

    const hashed = await hashPassword(password)
    await User.findByIdAndUpdate(record.userId, { password: hashed })
    resetTokens.delete(token)

    return success(res, {}, 'Đặt lại mật khẩu thành công')
  } catch (err) { next(err) }
}

// UC5: Đổi mật khẩu
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) return error(res, 'Vui lòng điền đầy đủ', 400)
    if (newPassword.length < 6) return error(res, 'Mật khẩu mới phải có ít nhất 6 ký tự', 400)

    const user = await User.findById(req.user._id)
    const match = await comparePassword(oldPassword, user.password)
    if (!match) return error(res, 'Mật khẩu cũ không đúng', 400)

    user.password = await hashPassword(newPassword)
    await user.save()
    return success(res, {}, 'Đổi mật khẩu thành công')
  } catch (err) { next(err) }
}

// UC6: Cập nhật hồ sơ
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatarUrl, phone, timezone, language } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatarUrl, phone, timezone, language },
      { new: true, runValidators: true }
    ).select('-password')
    return success(res, user, 'Cập nhật thông tin thành công')
  } catch (err) { next(err) }
}

module.exports = { register, login, logout, getMe, forgotPassword, resetPassword, changePassword, updateProfile }
