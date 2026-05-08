import { useState, useEffect } from 'react'
import {
  getFinancialOverviewAPI, getTransactionsAPI, createTransactionAPI,
  approveTransactionAPI, deleteTransactionAPI, upsertBudgetAPI, getBudgetAPI
} from '../services/financeService'
import { useAuth } from '../hooks/useAuth'

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n || 0) + ' ₫'
const statusColor = { pending: '#f59e0b', approved: '#22c55e', rejected: '#ef4444' }
const statusLabel = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' }

export default function FinanceView({ projectId }) {
  const { user }                          = useAuth()
  const [overview, setOverview]           = useState(null)
  const [transactions, setTransactions]   = useState([])
  const [budget, setBudget]               = useState(null)
  const [loading, setLoading]             = useState(true)
  const [showTxForm, setShowTxForm]       = useState(false)
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [tab, setTab]                     = useState('overview') // overview | transactions | budget
  const [txForm, setTxForm]               = useState({ type: 'expense', amount: '', description: '', category: 'Chung', date: '' })
  const [budgetForm, setBudgetForm]       = useState({ totalAmount: '', currency: 'VND' })

  const isPM = user?.role === 'admin' || user?.role === 'pm'

  const load = async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const [ovRes, txRes, buRes] = await Promise.all([
        getFinancialOverviewAPI(projectId),
        getTransactionsAPI(projectId),
        getBudgetAPI(projectId),
      ])
      setOverview(ovRes.data?.data || null)
      setTransactions(txRes.data?.data || [])
      const b = buRes.data?.data || null
      setBudget(b)
      setBudgetForm({ totalAmount: b?.totalAmount || '', currency: b?.currency || 'VND' })
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [projectId])

  const handleCreateTx = async (e) => {
    e.preventDefault()
    try {
      const r = await createTransactionAPI({ ...txForm, projectId, amount: parseFloat(txForm.amount) })
      setTransactions(prev => [r.data?.data || r.data, ...prev])
      setShowTxForm(false)
      setTxForm({ type: 'expense', amount: '', description: '', category: 'Chung', date: '' })
      load()
    } catch (e) { alert(e.response?.data?.message || 'Lỗi thêm giao dịch') }
  }

  const handleApprove = async (id, status) => {
    try {
      const r = await approveTransactionAPI(id, status)
      const updated = r.data?.data || r.data
      setTransactions(prev => prev.map(t => t._id === id ? updated : t))
      load()
    } catch (e) { alert('Lỗi duyệt giao dịch') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xoá giao dịch này?')) return
    try {
      await deleteTransactionAPI(id)
      setTransactions(prev => prev.filter(t => t._id !== id))
      load()
    } catch (e) { alert('Lỗi xoá') }
  }

  const handleBudget = async (e) => {
    e.preventDefault()
    try {
      await upsertBudgetAPI({ projectId, totalAmount: parseFloat(budgetForm.totalAmount), currency: budgetForm.currency })
      setShowBudgetForm(false)
      load()
    } catch (e) { alert('Lỗi cập nhật ngân sách') }
  }

  if (!projectId) return <div style={{ padding: 40, color: 'var(--text-muted)', textAlign: 'center' }}>Vui lòng chọn dự án</div>
  if (loading) return <div className="board-loading">Đang tải tài chính...</div>

  const budgetPct = overview?.totalAmount > 0 ? Math.min(100, (overview.totalExpense / overview.totalAmount * 100)) : 0

  return (
    <div className="view-container">
      <div className="subheader">
        <span className="board-title">💰 Quản lý Ngân sách</span>
        <div className="subheader-actions">
          {isPM && <button className="sh-btn" onClick={() => setShowBudgetForm(true)}>Cài ngân sách</button>}
          <button className="sh-btn" onClick={() => setShowTxForm(true)}>+ Thêm giao dịch</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px', marginBottom: 16 }}>
        {[['overview','Tổng quan'],['transactions','Giao dịch'],['budget','Ngân sách']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ padding: '8px 16px', fontSize: 13, border: 'none', background: 'none', cursor: 'pointer',
              color: tab === id ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1, fontWeight: tab === id ? 600 : 400 }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="report-body">
          <div className="stat-grid">
            {[
              { label: 'Ngân sách', value: fmt(overview?.totalAmount), color: '#3b82f6' },
              { label: 'Tổng thu',  value: fmt(overview?.totalIncome),  color: '#22c55e' },
              { label: 'Tổng chi',  value: fmt(overview?.totalExpense), color: '#ef4444' },
              { label: 'Số dư',     value: fmt(overview?.balance),       color: overview?.balance >= 0 ? '#22c55e' : '#ef4444' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-value" style={{ color: s.color, fontSize: 18 }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Budget progress bar */}
          {overview?.totalAmount > 0 && (
            <div style={{ margin: '0 20px 20px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Tiêu thụ ngân sách</span>
                <span style={{ fontWeight: 600, color: budgetPct >= 100 ? '#ef4444' : budgetPct >= 80 ? '#f59e0b' : '#22c55e' }}>
                  {budgetPct.toFixed(1)}%
                </span>
              </div>
              <div style={{ height: 10, background: 'var(--border)', borderRadius: 999 }}>
                <div style={{ height: '100%', borderRadius: 999, width: `${budgetPct}%`,
                  background: budgetPct >= 100 ? '#ef4444' : budgetPct >= 80 ? '#f59e0b' : '#22c55e',
                  transition: 'width .4s' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>
                <span>Đã chi: {fmt(overview?.totalExpense)}</span>
                <span>Ngân sách: {fmt(overview?.totalAmount)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'transactions' && (
        <div style={{ padding: '0 20px' }}>
          {transactions.length === 0
            ? <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Chưa có giao dịch</div>
            : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {transactions.map(tx => (
                <div key={tx._id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 20 }}>{tx.type === 'income' ? '📈' : '📉'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{tx.description || tx.category}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                      {tx.category} · {new Date(tx.date || tx.createdAt).toLocaleDateString('vi-VN')} · {tx.createdBy?.name}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: tx.type === 'income' ? '#22c55e' : '#ef4444' }}>
                      {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                    </div>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: statusColor[tx.status] + '22', color: statusColor[tx.status] }}>
                      {statusLabel[tx.status]}
                    </span>
                  </div>
                  {isPM && tx.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="project-action-btn edit" onClick={() => handleApprove(tx._id, 'approved')} title="Duyệt">✓</button>
                      <button className="project-action-btn delete" onClick={() => handleApprove(tx._id, 'rejected')} title="Từ chối">✗</button>
                    </div>
                  )}
                  <button className="project-action-btn delete" onClick={() => handleDelete(tx._id)} title="Xoá">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'budget' && (
        <div style={{ padding: '0 20px' }}>
          {budget ? (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>Ngân sách hiện tại</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>{fmt(budget.totalAmount)}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Đơn vị: {budget.currency}</div>
              {isPM && <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setShowBudgetForm(true)}>Cập nhật ngân sách</button>}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Chưa có ngân sách</div>
              {isPM && <button className="btn-primary" onClick={() => setShowBudgetForm(true)}>Tạo ngân sách</button>}
            </div>
          )}
        </div>
      )}

      {/* Modal thêm giao dịch */}
      {showTxForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowTxForm(false)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2 className="modal-title">Thêm giao dịch</h2>
              <button className="modal-close" onClick={() => setShowTxForm(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleCreateTx}>
              <div className="modal-body">
                <div className="modal-row">
                  <div className="modal-field" style={{ flex: 1 }}>
                    <label className="modal-label">Loại</label>
                    <select className="modal-input" value={txForm.type} onChange={e => setTxForm(f=>({...f,type:e.target.value}))}>
                      <option value="expense">Chi tiêu</option>
                      <option value="income">Thu nhập</option>
                    </select>
                  </div>
                  <div className="modal-field" style={{ flex: 1 }}>
                    <label className="modal-label">Danh mục</label>
                    <input className="modal-input" value={txForm.category} onChange={e => setTxForm(f=>({...f,category:e.target.value}))} placeholder="Chung" />
                  </div>
                </div>
                <div className="modal-field">
                  <label className="modal-label">Số tiền (VND) *</label>
                  <input className="modal-input" type="number" min="0" value={txForm.amount} onChange={e => setTxForm(f=>({...f,amount:e.target.value}))} required placeholder="1000000" />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Mô tả</label>
                  <input className="modal-input" value={txForm.description} onChange={e => setTxForm(f=>({...f,description:e.target.value}))} placeholder="Mô tả giao dịch..." />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Ngày</label>
                  <input className="modal-input" type="date" value={txForm.date} onChange={e => setTxForm(f=>({...f,date:e.target.value}))} />
                </div>
              </div>
              <div className="modal-footer">
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <button type="button" className="btn-ghost" onClick={() => setShowTxForm(false)}>Huỷ</button>
                  <button type="submit" className="btn-primary">Thêm</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal cài ngân sách */}
      {showBudgetForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowBudgetForm(false)}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <h2 className="modal-title">Cài đặt ngân sách</h2>
              <button className="modal-close" onClick={() => setShowBudgetForm(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleBudget}>
              <div className="modal-body">
                <div className="modal-field">
                  <label className="modal-label">Tổng ngân sách *</label>
                  <input className="modal-input" type="number" min="0" value={budgetForm.totalAmount} onChange={e => setBudgetForm(f=>({...f,totalAmount:e.target.value}))} required placeholder="100000000" />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Đơn vị tiền tệ</label>
                  <select className="modal-input" value={budgetForm.currency} onChange={e => setBudgetForm(f=>({...f,currency:e.target.value}))}>
                    <option value="VND">VND</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <button type="button" className="btn-ghost" onClick={() => setShowBudgetForm(false)}>Huỷ</button>
                  <button type="submit" className="btn-primary">Lưu</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
