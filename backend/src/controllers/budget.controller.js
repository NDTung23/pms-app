const Budget      = require('../models/Budget')
const Transaction = require('../models/Transaction')
const { createNotification } = require('../services/notification.service')
const { success, error } = require('../utils/response')

const getBudget = async (req, res, next) => {
  try {
    let budget = await Budget.findOne({ project: req.query.projectId })
    if (!budget) budget = { project: req.query.projectId, totalAmount: 0, categories: [], currency: 'VND' }
    return success(res, budget)
  } catch (err) { next(err) }
}

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

const getTransactions = async (req, res, next) => {
  try {
    const { projectId, type, status, startDate, endDate } = req.query
    const filter = { project: projectId }
    if (type)   filter.type   = type
    if (status) filter.status = status
    if (startDate || endDate) {
      filter.date = {}
      if (startDate) filter.date.$gte = new Date(startDate)
      if (endDate)   filter.date.$lte = new Date(endDate)
    }

    const transactions = await Transaction.find(filter)
      .populate('createdBy',  'name email')
      .populate('approvedBy', 'name email')
      .sort({ date: -1 })
    return success(res, transactions)
  } catch (err) { next(err) }
}

const createTransaction = async (req, res, next) => {
  try {
    const { projectId, type, amount, description, category, date } = req.body
    const tx = await Transaction.create({
      project:  projectId,
      type, amount, description,
      category: category || 'Chung',
      date:     date || new Date(),
      createdBy: req.user._id,
      status: (req.user.role === 'pm' || req.user.role === 'admin') ? 'approved' : 'pending',
    })

    await checkBudgetAlert(projectId, req.user._id)

    return success(res, tx, 'Thêm giao dịch thành công', 201)
  } catch (err) { next(err) }
}

const approveTransaction = async (req, res, next) => {
  try {
    const { status } = req.body
    const tx = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status, approvedBy: req.user._id, approvedAt: new Date() },
      { new: true }
    ).populate('createdBy', 'name email')
    if (!tx) return error(res, 'Không tìm thấy giao dịch', 404)

    if (status === 'approved') await checkBudgetAlert(tx.project, req.user._id)

    return success(res, tx, status === 'approved' ? 'Đã duyệt' : 'Đã từ chối')
  } catch (err) { next(err) }
}

const deleteTransaction = async (req, res, next) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id)
    return success(res, {}, 'Đã xoá giao dịch')
  } catch (err) { next(err) }
}

const getFinancialOverview = async (req, res, next) => {
  try {
    const { projectId } = req.query
    const budget       = await Budget.findOne({ project: projectId })
    const transactions = await Transaction.find({ project: projectId, status: 'approved' })

    const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const balance      = totalIncome - totalExpense
    const budgetUsed   = budget?.totalAmount > 0
      ? parseFloat((totalExpense / budget.totalAmount * 100).toFixed(1))
      : 0

    // Tổng hợp theo category
    const byCategory = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount
    })

    return success(res, {
      totalAmount: budget?.totalAmount || 0,
      totalIncome, totalExpense, balance,
      budgetUsed,
      currency:    budget?.currency || 'VND',
      byCategory,
    })
  } catch (err) { next(err) }
}

// UC30: Xuất báo cáo tài chính CSV
const exportFinanceCSV = async (req, res, next) => {
  try {
    const { projectId, startDate, endDate } = req.query
    const filter = { project: projectId }
    if (startDate || endDate) {
      filter.date = {}
      if (startDate) filter.date.$gte = new Date(startDate)
      if (endDate)   filter.date.$lte = new Date(endDate)
    }

    const transactions = await Transaction.find(filter)
      .populate('createdBy',  'name')
      .populate('approvedBy', 'name')
      .sort({ date: -1 })

    const budget = await Budget.findOne({ project: projectId })

    // Tạo nội dung CSV
    const BOM = '﻿'  // UTF-8 BOM để Excel đọc đúng tiếng Việt
    const rows = [
      ['Báo cáo tài chính dự án'],
      ['Ngân sách tổng', budget?.totalAmount || 0, budget?.currency || 'VND'],
      [],
      ['Ngày', 'Loại', 'Danh mục', 'Mô tả', 'Số tiền', 'Trạng thái', 'Người tạo', 'Người duyệt'],
    ]

    transactions.forEach(t => {
      rows.push([
        new Date(t.date || t.createdAt).toLocaleDateString('vi-VN'),
        t.type === 'income' ? 'Thu' : 'Chi',
        t.category || 'Chung',
        t.description || '',
        t.amount,
        t.status === 'approved' ? 'Đã duyệt' : t.status === 'pending' ? 'Chờ duyệt' : 'Từ chối',
        t.createdBy?.name  || '',
        t.approvedBy?.name || '',
      ])
    })

    // Tổng kết
    const totalIncome  = transactions.filter(t => t.type === 'income' && t.status === 'approved').reduce((s, t) => s + t.amount, 0)
    const totalExpense = transactions.filter(t => t.type === 'expense' && t.status === 'approved').reduce((s, t) => s + t.amount, 0)
    rows.push([])
    rows.push(['Tổng thu', totalIncome])
    rows.push(['Tổng chi', totalExpense])
    rows.push(['Số dư',    totalIncome - totalExpense])

    const csv = BOM + rows.map(r => r.map(cell => {
      const s = String(cell ?? '')
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? '"' + s.replace(/"/g, '""') + '"'
        : s
    }).join(',')).join('\n')

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="finance-report.csv"')
    res.send(csv)
  } catch (err) { next(err) }
}

async function checkBudgetAlert(projectId, userId) {
  try {
    const budget = await Budget.findOne({ project: projectId })
    if (!budget || !budget.totalAmount) return

    const transactions = await Transaction.find({ project: projectId, status: 'approved', type: 'expense' })
    const totalExpense  = transactions.reduce((s, t) => s + t.amount, 0)
    const pct           = totalExpense / budget.totalAmount * 100

    if (pct >= 100 && !budget.alertSent100) {
      await createNotification({
        userId, type: 'system',
        title: '🚨 Vượt ngân sách!',
        body:  'Chi tiêu đã đạt ' + pct.toFixed(1) + '% ngân sách.',
        referenceId: projectId, referenceType: 'project',
      })
      await Budget.findByIdAndUpdate(budget._id, { alertSent100: true })
    } else if (pct >= 80 && !budget.alertSent80) {
      await createNotification({
        userId, type: 'system',
        title: '⚠️ Gần vượt ngân sách',
        body:  'Chi tiêu đã đạt ' + pct.toFixed(1) + '% ngân sách.',
        referenceId: projectId, referenceType: 'project',
      })
      await Budget.findByIdAndUpdate(budget._id, { alertSent80: true })
    }
  } catch (e) { console.error('checkBudgetAlert:', e) }
}

module.exports = {
  getBudget, upsertBudget, getTransactions, createTransaction,
  approveTransaction, deleteTransaction, getFinancialOverview, exportFinanceCSV,
}
