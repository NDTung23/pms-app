const Transaction = require('../models/Transaction')
const Budget      = require('../models/Budget')
const { success, error } = require('../utils/response')

// Hàm tạo CSV từ dữ liệu
function toCSV(rows, headers) {
  const headerLine = headers.join(',')
  const dataLines  = rows.map(row =>
    row.map(cell => {
      const s = String(cell || '')
      // Bọc trong quotes nếu có dấu phẩy hoặc xuống dòng
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? '"' + s.replace(/"/g, '""') + '"'
        : s
    }).join(',')
  )
  return '\uFEFF' + [headerLine, ...dataLines].join('\n') // BOM cho Excel đọc UTF-8
}

// UC30: Xuất báo cáo tài chính CSV
const exportFinanceCSV = async (req, res, next) => {
  try {
    const { projectId } = req.query
    if (!projectId) return error(res, 'Thiếu projectId', 400)

    const [transactions, budget] = await Promise.all([
      Transaction.find({ project: projectId, status: 'approved' })
        .populate('createdBy', 'name')
        .sort({ date: -1 }),
      Budget.findOne({ project: projectId }),
    ])

    const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

    const headers = ['Ngày', 'Loại', 'Danh mục', 'Mô tả', 'Số tiền (VND)', 'Người tạo', 'Trạng thái']
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString('vi-VN'),
      t.type === 'income' ? 'Thu nhập' : 'Chi tiêu',
      t.category || 'Chung',
      t.description || '',
      t.amount.toLocaleString('vi-VN'),
      t.createdBy?.name || '',
      t.status === 'approved' ? 'Đã duyệt' : t.status,
    ])

    // Thêm dòng tổng kết
    rows.push([])
    rows.push(['', '', '', 'TỔNG THU', totalIncome.toLocaleString('vi-VN'), '', ''])
    rows.push(['', '', '', 'TỔNG CHI', totalExpense.toLocaleString('vi-VN'), '', ''])
    rows.push(['', '', '', 'SỐ DƯ',   (totalIncome - totalExpense).toLocaleString('vi-VN'), '', ''])
    if (budget?.totalAmount) {
      const pct = ((totalExpense / budget.totalAmount) * 100).toFixed(1)
      rows.push(['', '', '', 'NGÂN SÁCH', budget.totalAmount.toLocaleString('vi-VN'), '', ''])
      rows.push(['', '', '', 'ĐÃ DÙNG (%)', pct + '%', '', ''])
    }

    const csv = toCSV(rows, headers)
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="tai-chinh.csv"')
    res.send(csv)
  } catch (err) { next(err) }
}

module.exports = { exportFinanceCSV }
