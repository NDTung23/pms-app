import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import ProfilePage from '../pages/ProfilePage'
import { getNotificationsAPI, markReadAPI, markAllReadAPI } from '../services/notificationService'

export default function Navbar({ onMenuClick, onCreateProject, onTabChange }) {
  const { logout, user }                = useAuth()
  const [showProfile, setShowProfile]   = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotif, setShowNotif]       = useState(false)
  const [showSearch, setShowSearch]     = useState(false)
  const [searchText, setSearchText]     = useState('')
  const [notifs, setNotifs]             = useState([])
  const [unread, setUnread]             = useState(0)
  const searchRef = useRef(null)
  const notifRef  = useRef(null)
  const avatarRef = useRef(null)

  useEffect(() => {
    getNotificationsAPI()
      .then(r => {
        const data = r.data?.data || []
        setNotifs(data.slice(0, 8))
        setUnread(data.filter(n => !n.isRead).length)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current  && !notifRef.current.contains(e.target))  setShowNotif(false)
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setShowDropdown(false)
      if (searchRef.current && !searchRef.current.contains(e.target)) { setShowSearch(false) }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleMarkRead = async (id) => {
    try {
      await markReadAPI(id)
      setNotifs(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
      setUnread(prev => Math.max(0, prev - 1))
    } catch {}
  }

  const handleMarkAll = async () => {
    try {
      await markAllReadAPI()
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnread(0)
    } catch {}
  }

  const typeIcon = { assigned: '👤', deadline: '⏰', comment: '💬', system: '🔔' }

  function timeAgo(date) {
    const diff  = Date.now() - new Date(date).getTime()
    const mins  = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days  = Math.floor(diff / 86400000)
    if (mins < 1)   return 'Vừa xong'
    if (mins < 60)  return `${mins}p trước`
    if (hours < 24) return `${hours}h trước`
    return `${days}d trước`
  }

  return (
    <>
      <nav className="navbar">
        {/* Menu */}
        <button className="nav-icon-btn" onClick={onMenuClick} title="Menu">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6"  x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        {/* Logo */}
        <div className="navbar-logo">
          <div className="logo-icon"><span/><span/><span/><span/></div>
          PMS
        </div>

        {/* Search */}
        <div ref={searchRef} style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          {showSearch ? (
            <div style={{ position: 'relative' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                autoFocus
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') { setShowSearch(false); setSearchText('') } }}
                placeholder="Tìm kiếm dự án, thẻ..."
                style={{ width: '100%', padding: '8px 12px 8px 36px',
                  background: 'rgba(255,255,255,.08)', border: '1px solid var(--accent)',
                  borderRadius: 8, color: 'var(--text)', fontSize: 13, outline: 'none' }}
              />
            </div>
          ) : (
            <button onClick={() => setShowSearch(true)} className="navbar-search"
              style={{ width: '100%', textAlign: 'left', cursor: 'text' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              Tìm kiếm...
            </button>
          )}

          {/* Search hint dropdown */}
          {showSearch && searchText.trim().length > 1 && (
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
              background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10,
              boxShadow: '0 8px 32px rgba(0,0,0,.4)', zIndex: 200, overflow: 'hidden' }}>
              <div style={{ padding: '8px 14px', fontSize: 11, color: 'var(--text-faint)', borderBottom: '1px solid var(--border)' }}>
                Tìm kiếm: <strong style={{ color: 'var(--text)' }}>{searchText}</strong>
              </div>
              <button
                onClick={() => { onTabChange?.('projects'); setShowSearch(false); setSearchText('') }}
                style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                  cursor: 'pointer', textAlign: 'left', fontSize: 13, color: 'var(--text)',
                  display: 'flex', alignItems: 'center', gap: 10 }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span>🔍</span> Tìm trong tất cả dự án
              </button>
            </div>
          )}
        </div>

        <div className="navbar-right">
          {/* Tạo mới */}
          <button className="btn-create" onClick={() => onCreateProject?.()}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Tạo mới
          </button>

          {/* Chuông thông báo */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button className="nav-icon-btn" title="Thông báo"
              onClick={() => setShowNotif(o => !o)}
              style={{ position: 'relative' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unread > 0 && (
                <span style={{ position: 'absolute', top: 2, right: 2,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--navbar)' }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {showNotif && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                width: 340, background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,.4)', zIndex: 200, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    Thông báo {unread > 0 && <span style={{ color: '#ef4444' }}>({unread})</span>}
                  </span>
                  {unread > 0 && (
                    <button onClick={handleMarkAll}
                      style={{ fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Đọc tất cả
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {notifs.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-faint)' }}>
                      Không có thông báo nào
                    </div>
                  ) : notifs.map(n => (
                    <div key={n._id} onClick={() => handleMarkRead(n._id)}
                      style={{ padding: '10px 16px', display: 'flex', gap: 10, cursor: 'pointer',
                        background: n.isRead ? 'transparent' : 'rgba(37,99,235,.08)',
                        borderBottom: '1px solid var(--border)', transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(37,99,235,.08)'}
                    >
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{typeIcon[n.type] || '🔔'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 600, color: 'var(--text)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{n.body}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                        <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>{timeAgo(n.createdAt)}</span>
                        {!n.isRead && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3b82f6' }} />}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                  <button onClick={() => { onTabChange?.('inbox'); setShowNotif(false) }}
                    style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Xem tất cả thông báo →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Avatar dropdown */}
          <div ref={avatarRef} style={{ position: 'relative' }}>
            <button className="avatar" title={user?.name}
              onClick={() => setShowDropdown(o => !o)}
              style={{ cursor: 'pointer', border: showDropdown ? '2px solid var(--accent)' : '2px solid transparent' }}>
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="avatar"
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : (user?.name ? user.name.charAt(0).toUpperCase() : 'U')}
            </button>

            {showDropdown && (
              <div className="dropdown" style={{ right: 0, left: 'auto', minWidth: 220, top: 'calc(100% + 8px)' }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{user?.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{user?.email}</div>
                  <div style={{ fontSize: 10, marginTop: 6, padding: '2px 8px', borderRadius: 20, display: 'inline-block',
                    background: user?.role === 'admin' ? '#ef444422' : user?.role === 'pm' ? '#f59e0b22' : '#3b82f622',
                    color:      user?.role === 'admin' ? '#ef4444'   : user?.role === 'pm' ? '#f59e0b'   : '#3b82f6' }}>
                    {user?.role === 'admin' ? '⚙️ Admin' : user?.role === 'pm' ? '📋 PM' : '👤 Thành viên'}
                  </div>
                </div>

                <button className="dropdown-item" onClick={() => { setShowProfile(true); setShowDropdown(false) }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  Hồ sơ cá nhân
                </button>

                <button className="dropdown-item" onClick={() => { onTabChange?.('inbox'); setShowDropdown(false) }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
                    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
                  </svg>
                  Hộp thư đến
                  {unread > 0 && (
                    <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', fontSize: 10, padding: '1px 6px', borderRadius: 20 }}>
                      {unread}
                    </span>
                  )}
                </button>

                {user?.role === 'admin' && (
                  <button className="dropdown-item" onClick={() => { onTabChange?.('admin'); setShowDropdown(false) }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
                    </svg>
                    Quản trị hệ thống
                  </button>
                )}

                <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />

                <button className="dropdown-item danger" onClick={logout}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showProfile && <ProfilePage onClose={() => setShowProfile(false)} />}
    </>
  )
}
