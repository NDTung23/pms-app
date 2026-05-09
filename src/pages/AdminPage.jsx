import { useState, useEffect } from 'react'
import { getUsersAPI, changeRoleAPI, toggleActiveAPI, deleteUserAPI } from '../services/adminService'
import { getAuditLogsAPI } from '../services/auditService'
import WorkspaceSettings from '../components/WorkspaceSettings'
import api from '../services/api'

const roleLabel = { admin: 'Admin', pm: 'PM', member: 'Thanh vien' }
const roleColor = { admin: '#ef4444', pm: '#f59e0b', member: '#3b82f6' }

function timeAgo(date) {
  if (!date) return 'Chua dang nhap'
  const days = Math.floor((Date.now() - new Date(date)) / 86400000)
  if (days === 0) return 'Hom nay'
  if (days === 1) return 'Hom qua'
  return days + ' ngay truoc'
}

export default function AdminPage() {
  const [tab, setTab]             = useState('users')
  const [users, setUsers]         = useState([])
  const [auditLogs, setAudit]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [editUser, setEditUser]   = useState(null)
  const [newRole, setNewRole]     = useState('')
  const [showActivity, setShowActivity] = useState(null)
  const [activity, setActivity]   = useState([])
  const [actLoading, setActLoading] = useState(false)
  const [showWorkspace, setShowWorkspace] = useState(false)

  useEffect(() => {
    setLoading(true)
    if (tab === 'users') {
      getUsersAPI()
        .then(res => setUsers(res.data?.data || res.data || []))
        .finally(() => setLoading(false))
    } else if (tab === 'audit') {
      getAuditLogsAPI({ limit: 100 })
        .then(res => setAudit(res.data?.data?.logs || res.data?.data || []))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [tab])

  const loadActivity = async (user) => {
    setShowActivity(user)
    setActLoading(true)
    try {
      const r = await api.get('/users/' + user._id + '/activity')
      setActivity(r.data?.data || [])
    } catch { setActivity([]) }
    finally { setActLoading(false) }
  }

  const handleChangeRole = async () => {
    if (!editUser || !newRole) return
    try {
      const res = await changeRoleAPI(editUser._id, newRole)
      const updated = res.data?.data || res.data
      setUsers(prev => prev.map(u => u._id === updated._id ? { ...u, role: updated.role } : u))
      setEditUser(null)
    } catch (err) { alert(err.response?.data?.message || 'Loi doi role') }
  }

  const handleToggleActive = async (user) => {
    const action = user.isActive ? 'khoa' : 'mo khoa'
    if (!window.confirm(action + ' tai khoan "' + user.name + '"?')) return
    try {
      const res = await toggleActiveAPI(user._id)
      const { isActive } = res.data?.data || res.data
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive } : u))
    } catch (err) { alert(err.response?.data?.message || 'Loi') }
  }

  const handleDelete = async (user) => {
    if (!window.confirm('Xoa tai khoan "' + user.name + '"? Khong the hoan tac!')) return
    try {
      await deleteUserAPI(user._id)
      setUsers(prev => prev.filter(u => u._id !== user._id))
    } catch (err) { alert(err.response?.data?.message || 'Loi') }
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const TABS = [
    ['users',   '👥 Nguoi dung'],
    ['audit',   '📋 Nhat ky he thong'],
    ['workspace','⚙️ Cau hinh'],
  ]

  return (
    <div className="view-container">
      <div className="subheader">
        <span className="board-title">⚙️ Quan tri he thong</span>
        <div className="subheader-actions">
          <span className="sh-btn">{users.length} nguoi dung</span>
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px', marginBottom: 16 }}>
        {TABS.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ padding: '8px 16px', fontSize: 13, border: 'none', background: 'none', cursor: 'pointer',
              color: tab === id ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1, fontWeight: tab === id ? 600 : 400 }}>
            {label}
          </button>
        ))}
      </div>

      {/* USERS TAB */}
      {tab === 'users' && (
        <div className="admin-body">
          <div className="admin-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input className="admin-search-input" placeholder="Tim theo ten hoac email..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {loading ? <div className="board-loading">Dang tai...</div> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nguoi dung</th><th>Role</th><th>Trang thai</th>
                    <th>Dang nhap lan cuoi</th><th>Hanh dong</th>
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
                          background: roleColor[user.role] + '22',
                          color: roleColor[user.role],
                          border: '1px solid ' + roleColor[user.role] + '44' }}>
                          {roleLabel[user.role] || user.role}
                        </span>
                      </td>
                      <td>
                        <span className={'admin-status ' + (user.isActive ? 'active' : 'locked')}>
                          {user.isActive ? '✅ Hoat dong' : '🔒 Bi khoa'}
                        </span>
                      </td>
                      <td className="admin-lastlogin">{timeAgo(user.lastLogin)}</td>
                      <td>
                        <div className="admin-actions">
                          {/* Xem lich su hoat dong */}
                          <button className="admin-btn edit" onClick={() => loadActivity(user)} title="Lich su hoat dong">
                            📋
                          </button>
                          {/* Doi role */}
                          <button className="admin-btn edit"
                            onClick={() => { setEditUser(user); setNewRole(user.role) }} title="Doi role">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                              <circle cx="9" cy="7" r="4"/>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            Role
                          </button>
                          {/* Khoa/mo */}
                          <button className={'admin-btn ' + (user.isActive ? 'lock' : 'unlock')}
                            onClick={() => handleToggleActive(user)}>
                            {user.isActive ? 'Khoa' : 'Mo'}
                          </button>
                          {/* Xoa */}
                          <button className="admin-btn danger" onClick={() => handleDelete(user)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            </svg>
                            Xoa
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

      {/* AUDIT TAB */}
      {tab === 'audit' && (
        <div style={{ padding: '0 20px' }}>
          {loading ? <div className="board-loading">Dang tai...</div> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Thoi gian</th><th>Nguoi dung</th><th>Hanh dong</th><th>Tai nguyen</th><th>Chi tiet</th></tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-faint)', padding: 24 }}>
                      Chua co nhat ky nao
                    </td></tr>
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
                        <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 20,
                          background: 'rgba(59,130,246,.15)', color: '#3b82f6' }}>{log.action}</span>
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

      {/* WORKSPACE TAB */}
      {tab === 'workspace' && (
        <div style={{ padding: '0 20px' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>Cai dat Workspace</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Quan ly ten, logo, mui gio, chinh sach mat khau va cac tinh nang cua he thong.
            </div>
            <button className="btn-primary" onClick={() => setShowWorkspace(true)}>Mo cai dat Workspace</button>
          </div>
        </div>
      )}

      {/* Modal doi role */}
      {editUser && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditUser(null)}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <h2 className="modal-title">Doi role - {editUser.name}</h2>
              <button className="modal-close" onClick={() => setEditUser(null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">Chon role moi</label>
                <div className="role-picker">
                  {Object.entries(roleLabel).map(([value, label]) => (
                    <button key={value}
                      className={'role-option' + (newRole === value ? ' selected' : '')}
                      style={newRole === value ? {
                        background: roleColor[value] + '22',
                        borderColor: roleColor[value], color: roleColor[value] } : {}}
                      onClick={() => setNewRole(value)}>
                      <span className="role-dot" style={{ background: roleColor[value] }} />
                      {label}
                      <span style={{ fontSize: 10, opacity: .6 }}>
                        {value === 'admin' ? ' (toan quyen)' : value === 'pm' ? ' (quan ly DA)' : ' (thanh vien)'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button className="btn-ghost" onClick={() => setEditUser(null)}>Huy</button>
                <button className="btn-primary" onClick={handleChangeRole}
                  disabled={newRole === editUser.role}>Luu</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal lich su hoat dong — UC9 */}
      {showActivity && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowActivity(null)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h2 className="modal-title">Lich su hoat dong - {showActivity.name}</h2>
              <button className="modal-close" onClick={() => setShowActivity(null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: 400, overflowY: 'auto' }}>
              {actLoading ? (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>Dang tai...</div>
              ) : activity.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-faint)' }}>Chua co hoat dong nao</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {activity.map(log => (
                    <div key={log._id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start',
                      padding: '8px 12px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(59,130,246,.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                        {log.action === 'login' ? '🔑' : log.action === 'create' ? '➕' : log.action === 'delete' ? '🗑️' : '✏️'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
                          <span style={{ color: 'var(--accent)' }}>{log.action}</span>
                          {log.resource && <span style={{ color: 'var(--text-muted)' }}> - {log.resource}</span>}
                        </div>
                        {log.detail && <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>{log.detail}</div>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-faint)', flexShrink: 0 }}>
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showWorkspace && <WorkspaceSettings onClose={() => setShowWorkspace(false)} />}
    </div>
  )
}
