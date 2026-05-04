import { useState, useEffect } from 'react'
import { getDashboardAPI, getTaskStatsAPI } from '../services/reportService'

const priorityLabel = {
  urgent: { label: 'Khẩn cấp', color: '#ef4444' },
  high:   { label: 'Cao',       color: '#f59e0b' },
  medium: { label: 'Trung bình',color: '#3b82f6' },
  low:    { label: 'Thấp',      color: '#22c55e' },
}

export default function ReportView() {
  const [overview, setOverview] = useState(null)
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [ovRes, stRes] = await Promise.all([
          getDashboardAPI(),
          getTaskStatsAPI(),
        ])
        setOverview(ovRes.data?.data || ovRes.data)
        setStats(stRes.data?.data || stRes.data)
      } catch (err) {
        console.error('Lỗi load report:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="board-loading">Đang tải báo cáo...</div>

  const byList     = stats?.byList     || []
  const byPriority = stats?.byPriority || []
  const maxCount   = Math.max(...byList.map(l => l.count), 1)
  const maxPriority = Math.max(...byPriority.map(p => p.count), 1)

  return (
    <div className="view-container">
      <div className="subheader">
        <span className="board-title">Báo cáo &amp; Thống kê</span>
      </div>

      <div className="report-body">
        {/* Stat cards */}
        <div className="stat-grid">
          {[
            { label: 'Tổng thẻ',    value: overview?.totalCards   || 0, color: '#3b82f6' },
            { label: 'Quá hạn',     value: overview?.overdueCards || 0, color: '#ef4444' },
            { label: 'Khẩn cấp',    value: overview?.urgentCards  || 0, color: '#f59e0b' },
            { label: 'Dự án',       value: overview?.totalProjects|| 0, color: '#22c55e' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="report-charts">
          {/* Thẻ theo cột */}
          <div className="chart-card">
            <div className="chart-title">Thẻ theo cột</div>
            {byList.length === 0 ? (
              <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>Chưa có dữ liệu</div>
            ) : byList.map(l => (
              <div key={l.name} className="bar-row">
                <span className="bar-label">{l.name}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{
                    width: `${(l.count / maxCount) * 100}%`,
                    background: '#3b82f6'
                  }} />
                </div>
                <span className="bar-count">{l.count}</span>
              </div>
            ))}
          </div>

          {/* Thẻ theo ưu tiên */}
          <div className="chart-card">
            <div className="chart-title">Phân bổ độ ưu tiên</div>
            {byPriority.length === 0 ? (
              <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>Chưa có dữ liệu</div>
            ) : byPriority.map(p => {
              const info = priorityLabel[p._id] || { label: p._id, color: '#3b82f6' }
              return (
                <div key={p._id} className="bar-row">
                  <span className="bar-label">{info.label}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{
                      width: `${(p.count / maxPriority) * 100}%`,
                      background: info.color
                    }} />
                  </div>
                  <span className="bar-count">{p.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
