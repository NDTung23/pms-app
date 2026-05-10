import { useState, useEffect } from 'react'
import { addMemberAPI, removeMemberAPI } from '../services/projectService'
import api from '../services/api'

export default function MemberModal({ project, onClose, onUpdate }) {
  const [members, setMembers] = useState(project.members || [])
  const [email, setEmail]     = useState('')
  const [role, setRole]       = useState('member')
  const [loading, setLoading] = useState(false)
  const [err, setErr]         = useState('')

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setErr(''); setLoading(true)
    try {
      const searchRes = await api.get('/users/search?email=' + encodeURIComponent(email.trim()))
      const found     = searchRes.data?.data
      if (!found) { setErr('Không tìm thấy người dùng với email này!'); return }

      const already = members.find(m => (m.user?._id || m.user) === found._id)
      if (already)  { setErr('Người dùng này đã là thành viên!'); return }

      const res        = await addMemberAPI(project._id, found._id, role)
      const updated    = res.data?.data || res.data
      const newMembers = updated.members || []
      setMembers(newMembers)
      onUpdate({ ...project, members: newMembers })
      setEmail('')
    } catch (err) { setErr(err.response?.data?.message || 'Lỗi thêm thành viên') }
    finally { setLoading(false) }
  }

  const handleRemove = async (userId, userName) => {
    if (!window.confirm(`Xoá "${userName}" khỏi dự án?`)) return
    try {
      const res        = await removeMemberAPI(project._id, userId)
      const updated    = res.data?.data || res.data
      const newMembers = updated.members || []
      setMembers(newMembers)
      onUpdate({ ...project, members: newMembers })
    } catch (err) { alert(err.response?.data?.message || 'Lỗi xoá thành viên') }
  }

  const handleChangeRole = async (userId, newRole) => {
    try {
      await removeMemberAPI(project._id, userId)
      const res        = await addMemberAPI(project._id, userId, newRole)
      const updated    = res.data?.data || res.data
      const newMembers = updated.members || []
      setMembers(newMembers)
      onUpdate({ ...project, members: newMembers })
    } catch (err) { alert(err.response?.data?.message || 'Lỗi đổi role') }
  }

  const roleColor = { pm: '#f59e0b', member: '#3b82f6' }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h2 className="modal-title">Thành viên — {project.name}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-field">
            <label className="modal-label">Danh sách thành viên ({members.length})</label>
            <div className="member-list">
              {members.map((m, i) => {
                const u      = m.user || {}
                const userId = u._id || m.user
                const name   = u.name || 'Unknown'
                const email  = u.email || ''
                const mRole  = m.role || 'member'
                const isOwner = project.owner?._id === userId || project.owner === userId
                return (
                  <div key={i} className="member-item">
                    <div className="member-avatar">{name.charAt(0).toUpperCase()}</div>
                    <div className="member-info">
                      <div className="member-name">
                        {name}
                        {isOwner && (
                          <span style={{ fontSize: 10, marginLeft: 6, padding: '1px 6px', borderRadius: 20,
                            background: '#a855f722', color: '#a855f7', border: '1px solid #a855f744' }}>
                            Owner
                          </span>
                        )}
                      </div>
                      <div className="member-email">{email}</div>
                    </div>
                    {!isOwner ? (
                      <select value={mRole} onChange={e => handleChangeRole(userId, e.target.value)}
                        style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20,
                          border: '1px solid ' + roleColor[mRole] + '44',
                          background: roleColor[mRole] + '22', color: roleColor[mRole], cursor: 'pointer' }}>
                        <option value="member">Thành viên</option>
                        <option value="pm">Quản lý (PM)</option>
                      </select>
                    ) : (
                      <span className="member-role" style={{ background: '#a855f722', color: '#a855f7', border: '1px solid #a855f744' }}>
                        PM (Owner)
                      </span>
                    )}
                    {!isOwner && (
                      <button className="project-action-btn delete"
                        onClick={() => handleRemove(userId, name)} title="Xoá khỏi dự án">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6 6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="modal-field">
            <label className="modal-label">Mời thành viên mới</label>
            {err && <div className="auth-error" style={{ marginBottom: 8 }}>{err}</div>}
            <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input className="modal-input" type="email" placeholder="Nhập email người dùng..."
                value={email} onChange={e => { setEmail(e.target.value); setErr('') }}
                style={{ flex: 2, minWidth: 180 }} />
              <select className="modal-input" value={role} onChange={e => setRole(e.target.value)}
                style={{ flex: 1, minWidth: 130 }}>
                <option value="member">Thành viên</option>
                <option value="pm">Quản lý (PM)</option>
              </select>
              <button type="submit" className="btn-primary" disabled={loading} style={{ flexShrink: 0 }}>
                {loading ? '...' : 'Mời'}
              </button>
            </form>
          </div>
        </div>

        <div className="modal-footer">
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn-ghost" onClick={onClose}>Đóng</button>
          </div>
        </div>
      </div>
    </div>
  )
}
