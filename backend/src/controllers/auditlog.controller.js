const AuditLog = require('../models/AuditLog')
const { success } = require('../utils/response')

// UC37: Lấy logs với filter nâng cao + phân trang
const getLogs = async (req, res, next) => {
  try {
    const { resource, action, userId, limit = 50, page = 1 } = req.query
    const filter = {}
    if (resource) filter.resource = resource
    if (action)   filter.action   = action
    if (userId)   filter.user     = userId

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit)),
      AuditLog.countDocuments(filter),
    ])

    return success(res, { logs, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) })
  } catch (err) { next(err) }
}

// UC39: Ghi log với đầy đủ oldValue/newValue
const log = async ({ userId, action, resource, resourceId, detail, ip, oldValue, newValue }) => {
  try {
    await AuditLog.create({
      user: userId, action, resource, resourceId,
      detail, ip,
      // UC39: Lưu nội dung cũ và mới để audit trail đầy đủ
      oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : undefined,
      newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : undefined,
    })
  } catch (e) { console.error('AuditLog error:', e) }
}

module.exports = { getLogs, log }
