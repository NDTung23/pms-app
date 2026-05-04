import { useState, useEffect } from 'react'
import { addMemberAPI, removeMemberAPI } from '../services/projectService'
import api from '../services/api'

const roleLabel = { pm: 'Quản lý', member: 'Thành viên' }
const roleColor = { pm: '#f59e0b', member: '#3b82f6' }

export default function MemberModal({ project, onClose, onUpdate }) {
  const [members, setMembers]   = useState(project.members || [])
  const [email, setEmail]       = useState('')
  const [role, setRole]         = useState('member')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // Đóng khi bấm Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setError('')
    setLoading(true)
    try {
      // Tìm user theo email
      const searchRes = await api.get(`/users/search?email=${email.trim()}`)
      const user      = searchRes.data?.data

      if (!user) {
        setError('Không tìm thấy người dùng với email này!')
        return
      }

      // Kiểm tra đã có trong project chưa
      const already = members.find(m => (m.user?._id || m.user) === user._id)
      if (already) {
        setError('Người dùng này đã là thành viên!')
        return
      }

      const res        = await addMemberAPI(project._id, user._id, role)
      const updated    = res.data?.data || res.data
      const newMembers = updated.members || []
      setMembers(newMembers)
      onUpdate({ ...project, members: newMembers })
      setEmail('')
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi thêm thành viên')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (userId) => {
    if (!window.confirm('Xoá thành viên này khỏi dự án?')) return
    try {
      const res     = await removeMemberAPI(project._id, userId)
      const updated = res.data?.data || res.data
      const newMembers = updated.members || []
      setMembers(newMembers)
      onUpdate({ ...project, members: newMembers })
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi xoá thành viên')
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h2 className="modal-title">Thành viên — {project.name}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {/* Danh sách thành viên */}
          <div className="modal-field">
            <label className="modal-label">Danh sách thành viên ({members.length})</label>
            <div className="member-list">
              {members.map((m, i) => {
                const user   = m.user || {}
                const userId = user._id || m.user
                const name   = user.name || 'Unknown'
                const email  = user.email || ''
                const role   = m.role || 'member'
                return (
                  <div key={i} className="member-item">
                    <div className="member-avatar">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="member-info">
                      <div className="member-name">{name}</div>
                      <div className="member-email">{email}</div>
                    </div>
                    <span className="member-role" style={{
                      background: roleColor[role] + '22',
                      color: roleColor[role],
                      border: `1px solid ${roleColor[role]}44`,
                    }}>
                      {roleLabel[role] || role}
                    </span>
                    {role !== 'pm' && (
                      <button
                        className="project-action-btn delete"
                        onClick={() => handleRemove(userId)}
                        title="Xoá khỏi dự án"
                      >
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

          {/* Thêm thành viên */}
          <div className="modal-field">
            <label className="modal-label">Mời thành viên mới</label>
            {error && <div className="auth-error" style={{ marginBottom: 8 }}>{error}</div>}
            <form onSubmit={handleAdd} className="member-add-form">
              <input
                className="modal-input"
                type="email"
                placeholder="Nhập email người dùng..."
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
              />
              <select className="modal-input" style={{ width: 130, flexShrink: 0 }}
                value={role} onChange={e => setRole(e.target.value)}>
                <option value="member">Thành viên</option>
                <option value="pm">Quản lý</option>
              </select>
              <button type="submit" className="btn-primary" disabled={loading}>
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
