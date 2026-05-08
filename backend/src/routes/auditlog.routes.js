const express = require('express')
const router  = express.Router()
const { getLogs } = require('../controllers/auditlog.controller')
const { protect }   = require('../middlewares/auth.middleware')
const { authorize } = require('../middlewares/role.middleware')

router.use(protect)
router.get('/', authorize('admin'), getLogs)

module.exports = router
