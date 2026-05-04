const Notification = require('../models/Notification')
const { success } = require('../utils/response')

// UC22: Lấy thông báo
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 }).limit(50)
    return success(res, notifications)
  } catch (err) { next(err) }
}

// UC23: Đánh dấu đã đọc
const markRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true })
    return success(res, {}, 'Đã đánh dấu đọc')
  } catch (err) { next(err) }
}

// UC23: Đánh dấu tất cả đã đọc
const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true })
    return success(res, {}, 'Đã đọc tất cả')
  } catch (err) { next(err) }
}

// UC23: Xoá thông báo
const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findByIdAndDelete(req.params.id)
    return success(res, {}, 'Đã xoá thông báo')
  } catch (err) { next(err) }
}

module.exports = { getNotifications, markRead, markAllRead, deleteNotification }
