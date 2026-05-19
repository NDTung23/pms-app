const express = require('express')
const router  = express.Router()
const {
  getSprints, createSprint, updateSprint, closeSprint, getBurndown, getVelocity
} = require('../controllers/sprint.controller')
const { protect } = require('../middlewares/auth.middleware')
const { auditLog } = require('../middlewares/audit.middleware')

router.use(protect)
router.get('/',                      getSprints)
router.post('/',                     auditLog('create', 'sprint'), createSprint)
router.put('/:id',                   updateSprint)
router.patch('/:id/close',           auditLog('close', 'sprint'), closeSprint)  // UC15
router.get('/burndown/:sprintId',    getBurndown)
router.get('/velocity/:projectId',   getVelocity)

module.exports = router
