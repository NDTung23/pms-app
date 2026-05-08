import { useState, useEffect } from 'react'
import { getDashboardAPI, getTaskStatsAPI } from '../services/reportService'
import api from '../services/api'

const priorityLabel = {
  urgent: { label: 'Khẩn cấp', color: '#ef4444' },
  high:   { label: 'Cao',       color: '#f59e0b' },
  medium: { label: 'Trung bình',color: '#3b82f6' },
  low:    { label: 'Thấp',      color: '#22c55e' },
}

// Xuất báo cáo CSV (UC34)
function exportCSV(data, filename) {
  const rows = [
    ['Loại', 'Tên', 'Số lượng'],
    ...data.byList.map(l => ['Theo cột', l.name, l.count]),
    ...data.byPriority.map(p => ['Theo ưu tiên', priorityLabel[p._id]?.label || p._id, p.count]),
  ]
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function ReportView({ projectId }) {
  const [overview, setOverview]   = useState(null)
  const [stats, setStats]         = useState(null)
  const [progress, setProgress]   = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const reqs = [getDashboardAPI(), getTaskStatsAPI()]
        if (projectId) reqs.push(api.get(`/reports/progress?projectId=${projectId}`))
        const results = await Promise.all(reqs)
        setOverview(results[0].data?.data || results[0].data)
        setStats(results[1].data?.data || results[1].data)
        if (results[2]) setProgress(results[2].data?.data || results[2].data)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [projectId])

  if (loading) return <div className="board-loading">Đang tải báo cáo...</div>

  const byList      = stats?.byList     || []
  const byPriority  = stats?.byPriority || []
  const byMember    = stats?.byMember   || []
  const maxList     = Math.max(...byList.map(l => l.count), 1)
  const maxPriority = Math.max(...byPriority.map(p => p.count), 1)
  const maxMember   = Math.max(...byMember.map(m => m.count), 1)

  return (
    <div className="view-container">
      <div className="subheader">
        <span className="board-title">📊 Báo cáo &amp; Thống kê</span>
        <div className="subheader-actions">
          {stats && (
            <button className="sh-btn" onClick={() => exportCSV(stats, 'bao-cao-pms.csv')}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Xuất CSV
            </button>
          )}
        </div>
      </div>

      <div className="report-body">
        {/* Stat cards */}
        <div className="stat-grid">
          {[
            { label: 'Tổng thẻ',   value: overview?.totalCards    || 0, color: '#3b82f6' },
            { label: 'Quá hạn',    value: overview?.overdueCards  || 0, color: '#ef4444' },
            { label: 'Khẩn cấp',   value: overview?.urgentCards   || 0, color: '#f59e0b' },
            { label: 'Hoàn thành', value: overview?.doneCards     || 0, color: '#22c55e' },
            { label: 'Dự án',      value: overview?.totalProjects || 0, color: '#a855f7' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tiến độ dự án — UC14 */}
        {progress && (
          <div style={{ margin: '0 20px 16px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>📈 Tiến độ dự án</div>
              <span style={{ fontSize: 20, fontWeight: 700, color: progress.percentage >= 80 ? '#22c55e' : progress.percentage >= 50 ? '#f59e0b' : '#3b82f6' }}>
                {progress.percentage}%
              </span>
            </div>
            <div style={{ height: 12, background: 'var(--border)', borderRadius: 999, marginBottom: 12 }}>
              <div style={{ height: '100%', borderRadius: 999, width: `${progress.percentage}%`,
                background: `linear-gradient(90deg, #3b82f6, ${progress.percentage >= 80 ? '#22c55e' : '#60a5fa'})`,
                transition: 'width .5s ease' }} />
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {(progress.byList || []).map(l => (
                <div key={l.title} style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{l.title}</span>: {l.count} thẻ
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="report-charts">
          {/* Thẻ theo cột */}
          <div className="chart-card">
            <div className="chart-title">Thẻ theo cột</div>
            {byList.length === 0
              ? <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>Chưa có dữ liệu</div>
              : byList.map(l => (
                <div key={l.name} className="bar-row">
                  <span className="bar-label">{l.name}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(l.count / maxList) * 100}%`, background: '#3b82f6' }} />
                  </div>
                  <span className="bar-count">{l.count}</span>
                </div>
              ))
            }
          </div>

          {/* Thẻ theo ưu tiên */}
          <div className="chart-card">
            <div className="chart-title">Phân bổ độ ưu tiên</div>
            {byPriority.length === 0
              ? <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>Chưa có dữ liệu</div>
              : byPriority.map(p => {
                const info = priorityLabel[p._id] || { label: p._id, color: '#3b82f6' }
                return (
                  <div key={p._id} className="bar-row">
                    <span className="bar-label">{info.label}</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${(p.count / maxPriority) * 100}%`, background: info.color }} />
                    </div>
                    <span className="bar-count">{p.count}</span>
                  </div>
                )
              })
            }
          </div>

          {/* Thẻ theo thành viên — UC33 */}
          {byMember.length > 0 && (
            <div className="chart-card">
              <div className="chart-title">Thẻ theo thành viên</div>
              {byMember.map((m, i) => (
                <div key={i} className="bar-row">
                  <span className="bar-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                      {(m.name || '?')[0].toUpperCase()}
                    </span>
                    {m.name || 'Unknown'}
                  </span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(m.count / maxMember) * 100}%`, background: '#a855f7' }} />
                  </div>
                  <span className="bar-count">{m.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
