import { useState, useEffect } from 'react'
import { getUsersAPI, changeRoleAPI, toggleActiveAPI, deleteUserAPI } from '../services/adminService'
import { getAuditLogsAPI } from '../services/auditService'

const roleLabel = { admin: 'Admin', pm: 'PM', member: 'Thành viên' }
const roleColor = { admin: '#ef4444', pm: '#f59e0b', member: '#3b82f6' }

function timeAgo(date) {
  if (!date) return 'Chưa đăng nhập'
  const days = Math.floor((Date.now() - new Date(date)) / 86400000)
  if (days === 0) return 'Hôm nay'
  if (days === 1) return 'Hôm qua'
  return `${days} ngày trước`
}

export default function AdminPage() {
  const [tab, setTab]           = useState('users')   // users | audit
  const [users, setUsers]       = useState([])
  const [auditLogs, setAudit]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [editUser, setEditUser] = useState(null)
  const [newRole, setNewRole]   = useState('')

  useEffect(() => {
    if (tab === 'users') {
      getUsersAPI()
        .then(res => setUsers(res.data?.data || res.data || []))
        .finally(() => setLoading(false))
    } else {
      setLoading(true)
      getAuditLogsAPI({ limit: 100 })
        .then(res => setAudit(res.data?.data?.logs || res.data?.data || []))
        .finally(() => setLoading(false))
    }
  }, [tab])

  const handleChangeRole = async () => {
    if (!editUser || !newRole) return
    try {
      const res = await changeRoleAPI(editUser._id, newRole)
      const updated = res.data?.data || res.data
      setUsers(prev => prev.map(u => u._id === updated._id ? { ...u, role: updated.role } : u))
      setEditUser(null)
    } catch (err) { alert(err.response?.data?.message || 'Lỗi đổi role') }
  }

  const handleToggleActive = async (user) => {
    const action = user.isActive ? 'khoá' : 'mở khoá'
    if (!window.confirm(`${action} tài khoản "${user.name}"?`)) return
    try {
      const res = await toggleActiveAPI(user._id)
      const { isActive } = res.data?.data || res.data
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive } : u))
    } catch (err) { alert(err.response?.data?.message || 'Lỗi') }
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`Xoá tài khoản "${user.name}"? Không thể hoàn tác!`)) return
    try {
      await deleteUserAPI(user._id)
      setUsers(prev => prev.filter(u => u._id !== user._id))
    } catch (err) { alert(err.response?.data?.message || 'Lỗi') }
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="view-container">
      <div className="subheader">
        <span className="board-title">⚙️ Quản trị hệ thống</span>
        <div className="subheader-actions">
          <span className="sh-btn">{users.length} người dùng</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px', marginBottom: 16 }}>
        {[['users','👥 Người dùng'],['audit','📋 Nhật ký hệ thống']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ padding: '8px 16px', fontSize: 13, border: 'none', background: 'none', cursor: 'pointer',
              color: tab === id ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1, fontWeight: tab === id ? 600 : 400 }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="admin-body">
          <div className="admin-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input className="admin-search-input" placeholder="Tìm theo tên hoặc email..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {loading ? <div className="board-loading">Đang tải...</div> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Người dùng</th><th>Role</th><th>Trạng thái</th>
                    <th>Đăng nhập lần cuối</th><th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(user => (
                    <tr key={user._id}>
                      <td>
                        <div className="admin-user-cell">
                          <div className="admin-avatar">{user.name.charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="admin-user-name">{user.name}</div>
                            <div className="admin-user-email">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="admin-role-badge" style={{
                          background: roleColor[user.role] + '22', color: roleColor[user.role],
                          border: `1px solid ${roleColor[user.role]}44`,
                        }}>{roleLabel[user.role] || user.role}</span>
                      </td>
                      <td>
                        <span className={`admin-status ${user.isActive ? 'active' : 'locked'}`}>
                          {user.isActive ? '✅ Hoạt động' : '🔒 Bị khoá'}
                        </span>
                      </td>
                      <td className="admin-lastlogin">{timeAgo(user.lastLogin)}</td>
                      <td>
                        <div className="admin-actions">
                          <button className="admin-btn edit" onClick={() => { setEditUser(user); setNewRole(user.role) }} title="Đổi role">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                              <circle cx="9" cy="7" r="4"/>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            Role
                          </button>
                          <button className={`admin-btn ${user.isActive ? 'lock' : 'unlock'}`} onClick={() => handleToggleActive(user)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              {user.isActive
                                ? <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>
                                : <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></>}
                            </svg>
                            {user.isActive ? 'Khoá' : 'Mở'}
                          </button>
                          <button className="admin-btn danger" onClick={() => handleDelete(user)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            </svg>
                            Xoá
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'audit' && (
        <div style={{ padding: '0 20px' }}>
          {loading ? <div className="board-loading">Đang tải...</div> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Thời gian</th><th>Người dùng</th><th>Hành động</th><th>Tài nguyên</th><th>Chi tiết</th></tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-faint)', padding: 24 }}>Chưa có nhật ký nào</td></tr>
                  ) : auditLogs.map(log => (
                    <tr key={log._id}>
                      <td style={{ fontSize: 12, color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td>
                        <div style={{ fontSize: 13 }}>{log.user?.name || 'System'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{log.user?.email}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 20, background: 'rgba(59,130,246,.15)', color: '#3b82f6' }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{log.resource}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 200 }}>{log.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal đổi role */}
      {editUser && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditUser(null)}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <h2 className="modal-title">Đổi role — {editUser.name}</h2>
              <button className="modal-close" onClick={() => setEditUser(null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">Chọn role mới</label>
                <div className="role-picker">
                  {Object.entries(roleLabel).map(([value, label]) => (
                    <button key={value}
                      className={`role-option ${newRole === value ? 'selected' : ''}`}
                      style={newRole === value ? { background: roleColor[value]+'22', borderColor: roleColor[value], color: roleColor[value] } : {}}
                      onClick={() => setNewRole(value)}>
                      <span className="role-dot" style={{ background: roleColor[value] }} />
                      {label}
                      <span style={{ fontSize: 10, opacity: .6 }}>
                        {value === 'admin' ? ' (toàn quyền)' : value === 'pm' ? ' (quản lý DA)' : ' (thành viên)'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button className="btn-ghost" onClick={() => setEditUser(null)}>Huỷ</button>
                <button className="btn-primary" onClick={handleChangeRole} disabled={newRole === editUser.role}>Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
