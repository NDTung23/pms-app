const AuditLog = require('../models/AuditLog')
const { success } = require('../utils/response')

const getLogs = async (req, res, next) => {
  try {
    const { resource, limit = 100, page = 1 } = req.query
    const filter = {}
    if (resource) filter.resource = resource

    const logs = await AuditLog.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))

    const total = await AuditLog.countDocuments(filter)
    return success(res, { logs, total, page: parseInt(page) })
  } catch (err) { next(err) }
}

const log = async ({ userId, action, resource, resourceId, detail, ip, oldValue, newValue }) => {
  try {
    await AuditLog.create({ user: userId, action, resource, resourceId, detail, ip, oldValue, newValue })
  } catch (e) { console.error('AuditLog error:', e) }
}

module.exports = { getLogs, log }
