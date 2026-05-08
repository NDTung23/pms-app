import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import ProfilePage from '../pages/ProfilePage'

export default function Navbar({ onMenuClick }) {
  const { logout, user } = useAuth()
  const [showProfile, setShowProfile] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <>
      <nav className="navbar">
        <button className="nav-icon-btn" onClick={onMenuClick} title="Menu">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <div className="navbar-logo">
          <div className="logo-icon"><span/><span/><span/><span/></div>
          PMS
        </div>

        <div className="navbar-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          Tìm kiếm...
        </div>

        <div className="navbar-right">
          <button className="btn-create">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Tạo mới
          </button>

          <button className="nav-icon-btn" title="Thông báo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>

          {/* Avatar + dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className="avatar"
              title={user?.name}
              onClick={() => setShowDropdown(o => !o)}
              style={{ cursor: 'pointer', border: showDropdown ? '2px solid var(--accent)' : '2px solid transparent' }}
            >
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : (user?.name ? user.name.charAt(0).toUpperCase() : 'U')}
            </button>

            {showDropdown && (
              <div className="dropdown" style={{ right: 0, left: 'auto', minWidth: 200, top: 'calc(100% + 8px)' }}
                onMouseLeave={() => setShowDropdown(false)}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{user?.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{user?.email}</div>
                  <div style={{ fontSize: 10, marginTop: 4, padding: '2px 8px', borderRadius: 20, display: 'inline-block',
                    background: user?.role === 'admin' ? '#ef444422' : user?.role === 'pm' ? '#f59e0b22' : '#3b82f622',
                    color: user?.role === 'admin' ? '#ef4444' : user?.role === 'pm' ? '#f59e0b' : '#3b82f6' }}>
                    {user?.role === 'admin' ? 'Admin' : user?.role === 'pm' ? 'PM' : 'Thành viên'}
                  </div>
                </div>
                <button className="dropdown-item" onClick={() => { setShowProfile(true); setShowDropdown(false) }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Hồ sơ cá nhân
                </button>
                <button className="dropdown-item danger" onClick={logout}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
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
