const Notification = require('../models/Notification')

const createNotification = async ({ userId, type, title, body, referenceId, referenceType }) => {
  try {
    await Notification.create({ user: userId, type, title, body, referenceId, referenceType })
  } catch (err) {
    console.error('Lỗi tạo notification:', err)
  }
}

module.exports = { createNotification }
