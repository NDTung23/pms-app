const Budget      = require('../models/Budget')
const Transaction = require('../models/Transaction')
const { createNotification } = require('../services/notification.service')
const { success, error } = require('../utils/response')

// UC26: Lấy ngân sách theo project
const getBudget = async (req, res, next) => {
  try {
    let budget = await Budget.findOne({ project: req.query.projectId })
    if (!budget) budget = { project: req.query.projectId, totalAmount: 0, categories: [], currency: 'VND' }
    return success(res, budget)
  } catch (err) { next(err) }
}

// UC26: Tạo / cập nhật ngân sách
const upsertBudget = async (req, res, next) => {
  try {
    const { projectId, totalAmount, categories, currency } = req.body
    const budget = await Budget.findOneAndUpdate(
      { project: projectId },
      { totalAmount, categories, currency: currency || 'VND', alertSent80: false, alertSent100: false },
      { new: true, upsert: true }
    )
    return success(res, budget, 'Cập nhật ngân sách thành công')
  } catch (err) { next(err) }
}

// UC27: Lấy danh sách giao dịch
const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ project: req.query.projectId })
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ date: -1 })
    return success(res, transactions)
  } catch (err) { next(err) }
}

// UC27: Thêm giao dịch
const createTransaction = async (req, res, next) => {
  try {
    const { projectId, type, amount, description, category, date } = req.body
    const tx = await Transaction.create({
      project: projectId,
      type, amount, description,
      category: category || 'Chung',
      date: date || new Date(),
      createdBy: req.user._id,
      status: req.user.role === 'pm' || req.user.role === 'admin' ? 'approved' : 'pending',
    })

    // Kiểm tra cảnh báo ngân sách (UC29)
    await checkBudgetAlert(projectId, req.user._id)

    return success(res, tx, 'Thêm giao dịch thành công', 201)
  } catch (err) { next(err) }
}

// UC27: Duyệt / từ chối giao dịch
const approveTransaction = async (req, res, next) => {
  try {
    const { status } = req.body // 'approved' | 'rejected'
    const tx = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status, approvedBy: req.user._id, approvedAt: new Date() },
      { new: true }
    ).populate('createdBy', 'name email')
    if (!tx) return error(res, 'Không tìm thấy giao dịch', 404)
    return success(res, tx, status === 'approved' ? 'Đã duyệt' : 'Đã từ chối')
  } catch (err) { next(err) }
}

// UC27: Xoá giao dịch
const deleteTransaction = async (req, res, next) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id)
    return success(res, {}, 'Đã xoá giao dịch')
  } catch (err) { next(err) }
}

// UC28: Tổng quan tài chính
const getFinancialOverview = async (req, res, next) => {
  try {
    const { projectId } = req.query
    const budget = await Budget.findOne({ project: projectId })
    const transactions = await Transaction.find({ project: projectId, status: 'approved' })

    const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const balance      = totalIncome - totalExpense
    const budgetUsed   = budget?.totalAmount > 0 ? (totalExpense / budget.totalAmount * 100).toFixed(1) : 0

    return success(res, {
      totalAmount: budget?.totalAmount || 0,
      totalIncome, totalExpense, balance,
      budgetUsed: parseFloat(budgetUsed),
      currency: budget?.currency || 'VND',
      transactions,
    })
  } catch (err) { next(err) }
}

// UC29: Kiểm tra và gửi cảnh báo ngân sách
async function checkBudgetAlert(projectId, userId) {
  try {
    const budget = await Budget.findOne({ project: projectId })
    if (!budget || !budget.totalAmount) return

    const transactions = await Transaction.find({ project: projectId, status: 'approved', type: 'expense' })
    const totalExpense = transactions.reduce((s, t) => s + t.amount, 0)
    const pct = totalExpense / budget.totalAmount * 100

    if (pct >= 100 && !budget.alertSent100) {
      await createNotification({
        userId,
        type: 'system',
        title: '🚨 Vượt ngân sách!',
        body:  `Chi tiêu dự án đã đạt ${pct.toFixed(1)}% ngân sách.`,
        referenceId: projectId, referenceType: 'project',
      })
      await Budget.findByIdAndUpdate(budget._id, { alertSent100: true })
    } else if (pct >= 80 && !budget.alertSent80) {
      await createNotification({
        userId,
        type: 'system',
        title: '⚠️ Gần vượt ngân sách',
        body:  `Chi tiêu dự án đã đạt ${pct.toFixed(1)}% ngân sách.`,
        referenceId: projectId, referenceType: 'project',
      })
      await Budget.findByIdAndUpdate(budget._id, { alertSent80: true })
    }
  } catch (e) { console.error('checkBudgetAlert:', e) }
}

module.exports = { getBudget, upsertBudget, getTransactions, createTransaction, approveTransaction, deleteTransaction, getFinancialOverview }
