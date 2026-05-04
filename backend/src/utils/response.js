const success = (res, data = {}, message = 'Thành công', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data })
}

const error = (res, message = 'Lỗi server', statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message })
}

module.exports = { success, error }
