const crypto = require('crypto')
const User   = require('../models/User')
const { hashPassword, comparePassword } = require('../utils/hash')
const { generateToken } = require('../utils/jwt')
const { success, error } = require('../utils/response')
const { log } = require('./auditlog.controller')

const resetTokens = new Map()

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return error(res, 'Vui long dien day du thong tin', 400)
    if (password.length < 6)
      return error(res, 'Mat khau phai co it nhat 6 ky tu', 400)

    const exists = await User.findOne({ email: email.toLowerCase() })
    if (exists) return error(res, 'Email da duoc su dung', 400)

    const hashed = await hashPassword(password)
    const user   = await User.create({ name, email: email.toLowerCase(), password: hashed })
    const token  = generateToken(user._id)

    await log({ userId: user._id, action: 'register', resource: 'user', detail: 'Dang ky tai khoan moi', ip: req.ip })

    return success(res, {
      token,
      user: { _id: user._id, name, email: user.email, role: user.role, avatarUrl: user.avatarUrl }
    }, 'Dang ky thanh cong', 201)
  } catch (err) { next(err) }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return error(res, 'Vui long nhap email va mat khau', 400)

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return error(res, 'Email hoac mat khau khong dung', 401)
    if (!user.isActive) return error(res, 'Tai khoan da bi khoa', 403)

    const match = await comparePassword(password, user.password)
    if (!match) return error(res, 'Email hoac mat khau khong dung', 401)

    user.lastLogin = new Date()
    await user.save()

    const token = generateToken(user._id)
    await log({ userId: user._id, action: 'login', resource: 'user', detail: 'Dang nhap he thong', ip: req.ip })

    return success(res, {
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl, phone: user.phone, timezone: user.timezone, language: user.language }
    }, 'Dang nhap thanh cong')
  } catch (err) { next(err) }
}

const logout = async (req, res) => {
  await log({ userId: req.user._id, action: 'logout', resource: 'user', detail: 'Dang xuat', ip: req.ip }).catch(()=>{})
  return success(res, {}, 'Dang xuat thanh cong')
}

const getMe = async (req, res) => success(res, req.user)

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) return error(res, 'Vui long nhap email', 400)

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return success(res, {}, 'Neu email ton tai, link da duoc gui')

    const token   = crypto.randomBytes(32).toString('hex')
    const expires = Date.now() + 30 * 60 * 1000
    resetTokens.set(token, { userId: user._id.toString(), expires })

    const resetUrl = (process.env.CLIENT_URL || 'http://localhost:5173') + '/reset-password?token=' + token
    console.log('[DEV] Reset URL cho ' + email + ': ' + resetUrl)

    return success(res, {
      message: 'Link dat lai mat khau da duoc gui',
      ...(process.env.NODE_ENV === 'development' && { resetUrl, token })
    }, 'Da gui link dat lai mat khau')
  } catch (err) { next(err) }
}

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body
    if (!token || !password) return error(res, 'Thieu thong tin', 400)
    if (password.length < 6) return error(res, 'Mat khau phai co it nhat 6 ky tu', 400)

    const record = resetTokens.get(token)
    if (!record) return error(res, 'Token khong hop le hoac da het han', 400)
    if (Date.now() > record.expires) {
      resetTokens.delete(token)
      return error(res, 'Token da het han (30 phut)', 400)
    }

    const hashed = await hashPassword(password)
    await User.findByIdAndUpdate(record.userId, { password: hashed })
    resetTokens.delete(token)

    return success(res, {}, 'Dat lai mat khau thanh cong')
  } catch (err) { next(err) }
}

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) return error(res, 'Vui long dien day du', 400)
    if (newPassword.length < 6) return error(res, 'Mat khau moi phai co it nhat 6 ky tu', 400)

    const user = await User.findById(req.user._id)
    const match = await comparePassword(oldPassword, user.password)
    if (!match) return error(res, 'Mat khau cu khong dung', 400)

    user.password = await hashPassword(newPassword)
    await user.save()
    await log({ userId: req.user._id, action: 'change_password', resource: 'user', detail: 'Doi mat khau', ip: req.ip })
    return success(res, {}, 'Doi mat khau thanh cong')
  } catch (err) { next(err) }
}

const updateProfile = async (req, res, next) => {
  try {
    const { name, avatarUrl, phone, timezone, language } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatarUrl, phone, timezone, language },
      { new: true, runValidators: true }
    ).select('-password')
    return success(res, user, 'Cap nhat thong tin thanh cong')
  } catch (err) { next(err) }
}

module.exports = { register, login, logout, getMe, forgotPassword, resetPassword, changePassword, updateProfile }
