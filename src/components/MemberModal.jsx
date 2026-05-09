import { useState, useEffect } from 'react'
import { addMemberAPI, removeMemberAPI } from '../services/projectService'
import api from '../services/api'

const roleLabel = { pm: 'Quan ly (PM)', member: 'Thanh vien' }
const roleColor = { pm: '#f59e0b', member: '#3b82f6' }

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
      const searchRes = await api.get('/users/search?email=' + email.trim())
      const found     = searchRes.data?.data
      if (!found) { setErr('Khong tim thay nguoi dung voi email nay!'); return }

      const already = members.find(m => (m.user?._id || m.user) === found._id)
      if (already)  { setErr('Nguoi dung nay da la thanh vien!'); return }

      const res        = await addMemberAPI(project._id, found._id, role)
      const updated    = res.data?.data || res.data
      const newMembers = updated.members || []
      setMembers(newMembers)
      onUpdate({ ...project, members: newMembers })
      setEmail('')
    } catch (err) { setErr(err.response?.data?.message || 'Loi them thanh vien') }
    finally { setLoading(false) }
  }

  const handleRemove = async (userId, userName) => {
    if (!window.confirm('Xoa "' + userName + '" khoi du an?')) return
    try {
      const res        = await removeMemberAPI(project._id, userId)
      const updated    = res.data?.data || res.data
      const newMembers = updated.members || []
      setMembers(newMembers)
      onUpdate({ ...project, members: newMembers })
    } catch (err) { alert(err.response?.data?.message || 'Loi xoa thanh vien') }
  }

  // Thay doi role trong project
  const handleChangeRole = async (userId, newRole) => {
    try {
      // Xoa roi them lai voi role moi (API don gian nhat)
      const res1 = await removeMemberAPI(project._id, userId)
      const res2 = await addMemberAPI(project._id, userId, newRole)
      const updated    = res2.data?.data || res2.data
      const newMembers = updated.members || []
      setMembers(newMembers)
      onUpdate({ ...project, members: newMembers })
    } catch (err) { alert(err.response?.data?.message || 'Loi doi role') }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h2 className="modal-title">Thanh vien - {project.name}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {/* Danh sach */}
          <div className="modal-field">
            <label className="modal-label">
              Danh sach thanh vien ({members.length})
            </label>
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
                    {/* Role selector */}
                    {!isOwner ? (
                      <select
                        value={mRole}
                        onChange={e => handleChangeRole(userId, e.target.value)}
                        style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, border: '1px solid ' + roleColor[mRole] + '44',
                          background: roleColor[mRole] + '22', color: roleColor[mRole], cursor: 'pointer' }}>
                        <option value="member">Thanh vien</option>
                        <option value="pm">Quan ly (PM)</option>
                      </select>
                    ) : (
                      <span className="member-role" style={{ background: '#a855f722', color: '#a855f7', border: '1px solid #a855f744' }}>
                        PM (Owner)
                      </span>
                    )}
                    {!isOwner && (
                      <button className="project-action-btn delete"
                        onClick={() => handleRemove(userId, name)} title="Xoa khoi du an">
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

          {/* Moi thanh vien */}
          <div className="modal-field">
            <label className="modal-label">Moi thanh vien moi</label>
            {err && <div className="auth-error" style={{ marginBottom: 8 }}>{err}</div>}
            <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input className="modal-input" type="email" placeholder="Nhap email nguoi dung..."
                value={email} onChange={e => { setEmail(e.target.value); setErr('') }}
                style={{ flex: 2, minWidth: 180 }} />
              <select className="modal-input" value={role} onChange={e => setRole(e.target.value)}
                style={{ flex: 1, minWidth: 120 }}>
                <option value="member">Thanh vien</option>
                <option value="pm">Quan ly (PM)</option>
              </select>
              <button type="submit" className="btn-primary" disabled={loading} style={{ flexShrink: 0 }}>
                {loading ? '...' : 'Moi'}
              </button>
            </form>
          </div>
        </div>

        <div className="modal-footer">
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn-ghost" onClick={onClose}>Dong</button>
          </div>
        </div>
      </div>
    </div>
  )
}
