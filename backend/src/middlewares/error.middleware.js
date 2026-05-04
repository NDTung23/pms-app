const logger = require('../utils/logger')

const errorHandler = (err, req, res, next) => {
  logger.error(err.message)

  // Lỗi Mongoose: ObjectId không hợp lệ
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'ID không hợp lệ' })
  }

  // Lỗi Mongoose: trùng unique field
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(400).json({ success: false, message: `${field} đã tồn tại` })
  }

  // Lỗi validation Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({ success: false, message: messages.join(', ') })
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Lỗi server nội bộ',
  })
}

module.exports = { errorHandler }
