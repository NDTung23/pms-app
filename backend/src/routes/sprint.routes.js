const express = require('express')
const router  = express.Router()
const { getSprints, createSprint, updateSprint, closeSprint, getBurndown, getVelocity } = require('../controllers/sprint.controller')
const { protect }   = require('../middlewares/auth.middleware')
const { authorize } = require('../middlewares/role.middleware')

router.use(protect)
router.get('/',                         getSprints)
router.post('/',                        createSprint)
router.put('/:id',                      updateSprint)
router.patch('/:id/close',             closeSprint)
router.get('/burndown/:sprintId',       getBurndown)
router.get('/velocity/:projectId',      getVelocity)

module.exports = router
