const { log } = require('../controllers/auditlog.controller')

const auditLog = (action, resource) => async (req, res, next) => {
  const originalJson = res.json.bind(res)
  res.json = function(data) {
    if (res.statusCode < 400 && req.user) {
      log({
        userId:     req.user._id,
        action,
        resource,
        resourceId: req.params?.id || data?.data?._id,
        detail:     req.method + ' ' + req.path,
        ip:         req.ip,
      }).catch(() => {})
    }
    return originalJson(data)
  }
  next()
}

module.exports = { auditLog }
