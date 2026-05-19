import { useState, useEffect } from 'react'
import { getSprintsAPI, createSprintAPI, updateSprintAPI, closeSprintAPI, getBurndownAPI, getVelocityAPI } from '../services/sprintService'

const statusLabel = { planning: '📋 Lên kế hoạch', active: '🚀 Đang chạy', closed: '✅ Đã đóng' }
const statusColor = { planning: '#3b82f6', active: '#22c55e', closed: '#6b7280' }

function BurndownChart({ data, totalCards }) {
  if (!data?.length) return (
    <div style={{ color: 'var(--text-faint)', fontSize: 13, textAlign: 'center', padding: 20 }}>
      Chưa có dữ liệu burndown
    </div>
  )
  const maxVal = totalCards || 1
  const w = 500, h = 160, padL = 36, padB = 28, padT = 12, padR = 12
  const innerW = w - padL - padR
  const innerH = h - padT - padB
  const n = data.length
  const px = i => padL + (i / Math.max(n - 1, 1)) * innerW
  const py = v => padT + innerH - (v / maxVal) * innerH

  const actualPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(d.remaining).toFixed(1)}`).join(' ')
  const idealPath  = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(d.ideal).toFixed(1)}`).join(' ')

  return (
    <svg width={w} height={h} style={{ maxWidth: '100%', overflow: 'visible' }}>
      {[0, 0.25, 0.5, 0.75, 1].map(f => (
        <g key={f}>
          <line x1={padL} y1={py(maxVal * f)} x2={w - padR} y2={py(maxVal * f)}
            stroke="var(--border)" strokeDasharray="4,3" />
          <text x={padL - 4} y={py(maxVal * f) + 4} fontSize="10" fill="var(--text-faint)" textAnchor="end">
            {Math.round(maxVal * f)}
          </text>
        </g>
      ))}
      {data.filter((_, i) => i % Math.max(1, Math.floor(n / 6)) === 0 || i === n - 1).map((d, i, arr) => {
        const orig = data.findIndex(x => x.date === d.date)
        return <text key={i} x={px(orig)} y={h - 4} fontSize="9" fill="var(--text-faint)" textAnchor="middle">{d.date.slice(5)}</text>
      })}
      <path d={idealPath}  fill="none" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="6,4" />
      <path d={actualPath} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
      {data.map((d, i) => <circle key={i} cx={px(i)} cy={py(d.remaining)} r="3" fill="#3b82f6" />)}
      <line x1={padL}    y1={padT - 5} x2={padL + 20}  y2={padT - 5} stroke="#3b82f6" strokeWidth="2" />
      <text x={padL + 24} y={padT}     fontSize="10" fill="var(--text-muted)">Thực tế</text>
      <line x1={padL + 80} y1={padT - 5} x2={padL + 100} y2={padT - 5} stroke="#6b7280" strokeWidth="1.5" strokeDasharray="6,4" />
      <text x={padL + 104} y={padT}      fontSize="10" fill="var(--text-muted)">Lý tưởng</text>
    </svg>
  )
}

function VelocityChart({ data }) {
  if (!data?.length) return (
    <div style={{ color: 'var(--text-faint)', fontSize: 13, textAlign: 'center', padding: 20 }}>
      Chưa có sprint nào đã đóng
    </div>
  )
  const maxV = Math.max(...data.map(d => d.velocity), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{d.velocity}</span>
          <div style={{ width: '100%', background: 'linear-gradient(180deg,#3b82f6,#2563eb)',
            borderRadius: '4px 4px 0 0', height: Math.max((d.velocity / maxV) * 90, 4) + 'px' }} />
          <span style={{ fontSize: 9, color: 'var(--text-faint)', textAlign: 'center', lineHeight: 1.2 }}>{d.sprint}</span>
        </div>
      ))}
    </div>
  )
}

// UC15: Modal đóng sprint — chọn có chuyển task không và sprint nào
function CloseSprintModal({ sprint, allSprints, onClose, onConfirm }) {
  const [moveUnfinished, setMoveUnfinished] = useState(true)
  const [nextSprintId, setNextSprintId]     = useState('')

  // Sprint có thể nhận task: planning hoặc active, khác sprint đang đóng
  const eligibleSprints = allSprints.filter(s => s._id !== sprint._id && s.status !== 'closed')

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <h2 className="modal-title">Đóng sprint — {sprint.title}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          {/* Tuỳ chọn chuyển task */}
          <div style={{ background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.3)',
            borderRadius: 8, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: 6 }}>
              ⚠️ Lưu ý khi đóng sprint
            </div>
            <div style={{ fontSize: 12, color: '#92400e' }}>
              Các task chưa hoàn thành (status ≠ done) sẽ cần được xử lý.
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 16 }}>
            <input type="checkbox" checked={moveUnfinished}
              onChange={e => setMoveUnfinished(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                Chuyển task chưa xong sang sprint tiếp theo
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                Nếu bỏ chọn, các task sẽ giữ nguyên sprint nhưng sprint sẽ đóng
              </div>
            </div>
          </label>

          {moveUnfinished && (
            <div className="modal-field">
              <label className="modal-label">Sprint tiếp nhận task *</label>
              {eligibleSprints.length === 0 ? (
                <div style={{ fontSize: 13, color: '#ef4444', padding: '8px 12px',
                  background: 'rgba(239,68,68,.1)', borderRadius: 6 }}>
                  Không có sprint nào đang mở. Hãy tạo sprint mới trước.
                </div>
              ) : (
                <select className="modal-input" value={nextSprintId}
                  onChange={e => setNextSprintId(e.target.value)}>
                  <option value="">-- Chọn sprint --</option>
                  {eligibleSprints.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.title} ({statusLabel[s.status]})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn-ghost" onClick={onClose}>Huỷ</button>
            <button className="btn-primary"
              disabled={moveUnfinished && !nextSprintId}
              onClick={() => onConfirm({ moveUnfinished, nextSprintId })}>
              Đóng sprint
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SprintView({ projectId }) {
  const [sprints, setSprints]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [editSprint, setEdit]         = useState(null)
  const [selected, setSelected]       = useState(null)
  const [burndown, setBurndown]       = useState(null)
  const [velocity, setVelocity]       = useState([])
  const [closingSpint, setClosingSprint] = useState(null) // UC15
  const [form, setForm]               = useState({ title: '', goal: '', startDate: '', endDate: '' })

  useEffect(() => {
    if (!projectId) return
    setLoading(true)
    Promise.all([getSprintsAPI(projectId), getVelocityAPI(projectId)])
      .then(([r1, r2]) => {
        setSprints(r1.data?.data || [])
        setVelocity(r2.data?.data || [])
      })
      .finally(() => setLoading(false))
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
        setSprints(prev => prev.map(s => s._id === editSprint._id ? (r.data?.data || r.data) : s))
      } else {
        const r = await createSprintAPI({ ...form, projectId })
        setSprints(prev => [r.data?.data || r.data, ...prev])
      }
      setShowForm(false)
    } catch (e) { alert(e.response?.data?.message || 'Lỗi lưu sprint') }
  }

  // UC15: Đóng sprint với chuyển task
  const handleCloseConfirm = async ({ moveUnfinished, nextSprintId }) => {
    try {
      const r = await closeSprintAPI(closingSpint._id, { moveUnfinished, nextSprintId })
      const result = r.data?.data || r.data
      setSprints(prev => prev.map(s => s._id === closingSpint._id ? result.sprint || result : s))

      if (result.movedCount > 0) {
        alert(`✅ Đã đóng sprint!
↪️ Đã chuyển ${result.movedCount} task chưa hoàn thành sang sprint tiếp theo.`)
      }
      setClosingSprint(null)
    } catch (e) { alert(e.response?.data?.message || 'Lỗi đóng sprint') }
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, padding: '16px 20px' }}>
        {sprints.length === 0 && (
          <div style={{ gridColumn: '1/-1', color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>
            Chưa có sprint nào. Hãy tạo sprint đầu tiên!
          </div>
        )}
        {sprints.map(s => (
          <div key={s._id} className="project-card"
            style={{ cursor: 'pointer', border: selected?._id === s._id ? '1px solid var(--accent)' : undefined }}
            onClick={() => setSelected(s === selected ? null : s)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div className="project-card-name" style={{ margin: 0 }}>{s.title}</div>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20,
                background: statusColor[s.status] + '22', color: statusColor[s.status] }}>
                {statusLabel[s.status]}
              </span>
            </div>
            {s.goal && <div className="project-card-desc">{s.goal}</div>}
            {s.closedNote && (
              <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 6, background: 'rgba(245,158,11,.1)',
                padding: '4px 8px', borderRadius: 6 }}>
                📝 {s.closedNote}
              </div>
            )}
            <div className="project-card-meta" style={{ marginTop: 8 }}>
              <span style={{ fontSize: 11 }}>
                {s.startDate ? new Date(s.startDate).toLocaleDateString('vi-VN') : '?'}
                {' → '}
                {s.endDate   ? new Date(s.endDate).toLocaleDateString('vi-VN')   : '?'}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {s.status !== 'closed' && (
                  <button className="project-action-btn edit"
                    onClick={e => { e.stopPropagation(); openEdit(s) }} title="Sửa">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/>
                    </svg>
                  </button>
                )}
                {s.status !== 'closed' && (
                  <button className="project-action-btn delete"
                    onClick={e => { e.stopPropagation(); setClosingSprint(s) }} title="Đóng sprint"
                    style={{ background: 'rgba(239,68,68,.15)', color: '#ef4444' }}>
                    ✓ Đóng
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Burndown Chart */}
      {selected && (
        <div style={{ margin: '0 20px 20px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text)' }}>
            📉 Burndown Chart — {selected.title}
          </div>
          <BurndownChart data={burndown?.burndown} totalCards={burndown?.totalCards} />
        </div>
      )}

      {/* Velocity Chart */}
      <div style={{ margin: '0 20px 20px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text)' }}>⚡ Velocity Chart</div>
        <VelocityChart data={velocity} />
      </div>

      {/* Form tạo/sửa sprint */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editSprint ? 'Sửa sprint' : 'Tạo sprint mới'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-field">
                  <label className="modal-label">Tên sprint *</label>
                  <input className="modal-input" value={form.title} required autoFocus
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Sprint 1" />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Mục tiêu sprint</label>
                  <textarea className="modal-input modal-textarea" rows={2} value={form.goal}
                    onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} placeholder="Mục tiêu sprint..." />
                </div>
                <div className="modal-row">
                  <div className="modal-field" style={{ flex: 1 }}>
                    <label className="modal-label">Ngày bắt đầu</label>
                    <input className="modal-input" type="date" value={form.startDate}
                      onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                  </div>
                  <div className="modal-field" style={{ flex: 1 }}>
                    <label className="modal-label">Ngày kết thúc</label>
                    <input className="modal-input" type="date" value={form.endDate}
                      onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
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

      {/* UC15: Modal đóng sprint */}
      {closingSpint && (
        <CloseSprintModal
          sprint={closingSpint}
          allSprints={sprints}
          onClose={() => setClosingSprint(null)}
          onConfirm={handleCloseConfirm}
        />
      )}
    </div>
  )
}
