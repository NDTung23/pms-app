const express = require('express')
const router  = express.Router()
const { getBudget, upsertBudget, getTransactions, createTransaction, approveTransaction, deleteTransaction, getFinancialOverview } = require('../controllers/budget.controller')
const { protect }   = require('../middlewares/auth.middleware')
const { authorize } = require('../middlewares/role.middleware')

router.use(protect)
router.get('/budget',            getBudget)
router.post('/budget',           upsertBudget)
router.get('/transactions',      getTransactions)
router.post('/transactions',     createTransaction)
router.patch('/transactions/:id/approve', authorize('admin', 'pm'), approveTransaction)
router.delete('/transactions/:id',        deleteTransaction)
router.get('/overview',          getFinancialOverview)

module.exports = router
