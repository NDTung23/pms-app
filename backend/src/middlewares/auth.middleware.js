const { verifyToken } = require('../utils/jwt')
const { error } = require('../utils/response')
const User = require('../models/User')

const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization
    if (!auth || !auth.startsWith('Bearer ')) {
      return error(res, 'Không có token xác thực', 401)
    }

    const token = auth.split(' ')[1]
    const decoded = verifyToken(token)

    const user = await User.findById(decoded.id).select('-password')
    if (!user) return error(res, 'Tài khoản không tồn tại', 401)
    if (!user.isActive) return error(res, 'Tài khoản đã bị khoá', 403)

    req.user = user
    next()
  } catch (err) {
    return error(res, 'Token không hợp lệ hoặc đã hết hạn', 401)
  }
}

module.exports = { protect }
