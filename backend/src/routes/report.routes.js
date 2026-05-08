const express = require('express')
const router  = express.Router()
const { getOverview, getTaskStats, getBudgetReport, getPlannerCards, getProjectProgress } = require('../controllers/report.controller')
const { protect } = require('../middlewares/auth.middleware')

router.use(protect)
router.get('/overview',   getOverview)
router.get('/task-stats', getTaskStats)
router.get('/budget',     getBudgetReport)
router.get('/planner',    getPlannerCards)
router.get('/progress',   getProjectProgress)  // UC14

module.exports = router
