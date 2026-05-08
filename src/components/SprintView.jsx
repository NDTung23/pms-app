import { useState, useEffect } from 'react'
import { getSprintsAPI, createSprintAPI, updateSprintAPI, closeSprintAPI, getBurndownAPI, getVelocityAPI } from '../services/sprintService'

const statusLabel = { planning: '📋 Lên kế hoạch', active: '🚀 Đang chạy', closed: '✅ Đã đóng' }
const statusColor = { planning: '#3b82f6', active: '#22c55e', closed: '#6b7280' }

function BurndownChart({ data, totalCards }) {
  if (!data?.length) return <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>Chưa có dữ liệu</div>
  const maxVal = totalCards || 1
  const w = 480, h = 160, padL = 36, padB = 28, padT = 10, padR = 10
  const innerW = w - padL - padR
  const innerH = h - padT - padB
  const n = data.length

  const px = i => padL + (i / (n - 1)) * innerW
  const py = v => padT + innerH - (v / maxVal) * innerH

  const actualPath  = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(d.remaining).toFixed(1)}`).join(' ')
  const idealPath   = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(d.ideal).toFixed(1)}`).join(' ')

  return (
    <svg width={w} height={h} style={{ maxWidth: '100%', overflow: 'visible' }}>
      {/* Grid */}
      {[0,.25,.5,.75,1].map(f => (
        <g key={f}>
          <line x1={padL} y1={py(maxVal*f)} x2={w-padR} y2={py(maxVal*f)} stroke="var(--border)" strokeDasharray="4,3" />
          <text x={padL-4} y={py(maxVal*f)+4} fontSize="10" fill="var(--text-faint)" textAnchor="end">{Math.round(maxVal*f)}</text>
        </g>
      ))}
      {/* Labels ngày (tối đa 6) */}
      {data.filter((_,i) => i % Math.max(1, Math.floor(n/6)) === 0 || i === n-1).map((d,i,arr) => {
        const orig = data.findIndex(x => x.date === d.date)
        return <text key={i} x={px(orig)} y={h-4} fontSize="9" fill="var(--text-faint)" textAnchor="middle">{d.date.slice(5)}</text>
      })}
      {/* Ideal line */}
      <path d={idealPath} fill="none" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Actual line */}
      <path d={actualPath} fill="none" stroke="#3b82f6" strokeWidth="2" />
      {/* Dots */}
      {data.map((d, i) => <circle key={i} cx={px(i)} cy={py(d.remaining)} r="3" fill="#3b82f6" />)}
      {/* Legend */}
      <line x1={padL} y1={padT-4} x2={padL+20} y2={padT-4} stroke="#3b82f6" strokeWidth="2" />
      <text x={padL+24} y={padT} fontSize="10" fill="var(--text-muted)">Thực tế</text>
      <line x1={padL+80} y1={padT-4} x2={padL+100} y2={padT-4} stroke="#6b7280" strokeWidth="1.5" strokeDasharray="6,4" />
      <text x={padL+104} y={padT} fontSize="10" fill="var(--text-muted)">Lý tưởng</text>
    </svg>
  )
}

function VelocityChart({ data }) {
  if (!data?.length) return <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>Chưa có dữ liệu velocity</div>
  const maxV = Math.max(...data.map(d => d.velocity), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{d.velocity}</span>
          <div style={{ width: '100%', background: `linear-gradient(180deg,#3b82f6,#2563eb)`, borderRadius: '4px 4px 0 0',
            height: `${Math.max((d.velocity / maxV) * 90, 4)}px` }} />
          <span style={{ fontSize: 9, color: 'var(--text-faint)', textAlign: 'center', lineHeight: 1.2 }}>{d.sprint}</span>
        </div>
      ))}
    </div>
  )
}

export default function SprintView({ projectId }) {
  const [sprints, setSprints]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editSprint, setEdit]   = useState(null)
  const [selected, setSelected] = useState(null)
  const [burndown, setBurndown] = useState(null)
  const [velocity, setVelocity] = useState([])
  const [form, setForm]         = useState({ title: '', goal: '', startDate: '', endDate: '' })

  useEffect(() => {
    if (!projectId) return
    getSprintsAPI(projectId)
      .then(r => setSprints(r.data?.data || []))
      .finally(() => setLoading(false))
    getVelocityAPI(projectId).then(r => setVelocity(r.data?.data || []))
  }, [projectId])

  useEffect(() => {
    if (!selected) return
    getBurndownAPI(selected._id)
      .then(r => setBurndown(r.data?.data || null))
      .catch(() => setBurndown(null))
  }, [selected])

  const openCreate = () => { setEdit(null); setForm({ title: '', goal: '', startDate: '', endDate: '' }); setShowForm(true) }
  const openEdit   = (s) => { setEdit(s); setForm({ title: s.title, goal: s.goal || '', startDate: s.startDate?.slice(0,10) || '', endDate: s.endDate?.slice(0,10) || '' }); setShowForm(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editSprint) {
        const r = await updateSprintAPI(editSprint._id, form)
        const updated = r.data?.data || r.data
        setSprints(prev => prev.map(s => s._id === editSprint._id ? updated : s))
      } else {
        const r = await createSprintAPI({ ...form, projectId })
        setSprints(prev => [r.data?.data || r.data, ...prev])
      }
      setShowForm(false)
    } catch (e) { alert(e.response?.data?.message || 'Lỗi lưu sprint') }
  }

  const handleClose = async (sprint) => {
    if (!window.confirm(`Đóng sprint "${sprint.title}"?`)) return
    try {
      const r = await closeSprintAPI(sprint._id)
      const updated = r.data?.data || r.data
      setSprints(prev => prev.map(s => s._id === sprint._id ? updated : s))
    } catch (e) { alert('Lỗi đóng sprint') }
  }

  if (!projectId) return <div style={{ padding: 40, color: 'var(--text-muted)', textAlign: 'center' }}>Vui lòng chọn dự án</div>
  if (loading) return <div className="board-loading">Đang tải sprint...</div>

  return (
    <div className="view-container">
      <div className="subheader">
        <span className="board-title">🏃 Quản lý Sprint</span>
        <div className="subheader-actions">
          <button className="sh-btn" onClick={openCreate}>+ Tạo sprint</button>
        </div>
      </div>

      {/* Sprint list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '16px 20px' }}>
        {sprints.length === 0 && <div style={{ gridColumn: '1/-1', color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Chưa có sprint nào.</div>}
        {sprints.map(s => (
          <div key={s._id} className="project-card" style={{ cursor: 'pointer', border: selected?._id === s._id ? '1px solid var(--accent)' : undefined }}
            onClick={() => setSelected(s === selected ? null : s)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div className="project-card-name" style={{ margin: 0 }}>{s.title}</div>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: statusColor[s.status] + '22', color: statusColor[s.status] }}>
                {statusLabel[s.status]}
              </span>
            </div>
            {s.goal && <div className="project-card-desc">{s.goal}</div>}
            <div className="project-card-meta" style={{ marginTop: 8 }}>
              <span style={{ fontSize: 11 }}>{s.startDate ? new Date(s.startDate).toLocaleDateString('vi-VN') : '?'} → {s.endDate ? new Date(s.endDate).toLocaleDateString('vi-VN') : '?'}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {s.status !== 'closed' && (
                  <button className="project-action-btn edit" onClick={e => { e.stopPropagation(); openEdit(s) }} title="Sửa">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
                  </button>
                )}
                {s.status === 'active' && (
                  <button className="project-action-btn delete" onClick={e => { e.stopPropagation(); handleClose(s) }} title="Đóng sprint">✓</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Burndown chart khi chọn sprint */}
      {selected && (
        <div style={{ margin: '0 20px 20px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text)' }}>📉 Burndown Chart — {selected.title}</div>
          <BurndownChart data={burndown?.burndown} totalCards={burndown?.totalCards} />
        </div>
      )}

      {/* Velocity chart */}
      <div style={{ margin: '0 20px 20px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text)' }}>⚡ Velocity Chart</div>
        <VelocityChart data={velocity} />
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editSprint ? 'Sửa sprint' : 'Tạo sprint mới'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-field">
                  <label className="modal-label">Tên sprint *</label>
                  <input className="modal-input" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="Sprint 1" required autoFocus />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Mục tiêu</label>
                  <textarea className="modal-input modal-textarea" rows={2} value={form.goal} onChange={e => setForm(f=>({...f,goal:e.target.value}))} placeholder="Mục tiêu sprint..." />
                </div>
                <div className="modal-row">
                  <div className="modal-field" style={{ flex: 1 }}>
                    <label className="modal-label">Ngày bắt đầu</label>
                    <input className="modal-input" type="date" value={form.startDate} onChange={e => setForm(f=>({...f,startDate:e.target.value}))} />
                  </div>
                  <div className="modal-field" style={{ flex: 1 }}>
                    <label className="modal-label">Ngày kết thúc</label>
                    <input className="modal-input" type="date" value={form.endDate} onChange={e => setForm(f=>({...f,endDate:e.target.value}))} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Huỷ</button>
                  <button type="submit" className="btn-primary">{editSprint ? 'Lưu' : 'Tạo sprint'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
