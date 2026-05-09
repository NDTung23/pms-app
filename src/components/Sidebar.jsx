const NAV_ITEMS = [
  { id: 'projects', label: 'Du an', icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )},
  { id: 'board', label: 'Bang cong viec', icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="9" y1="21" x2="9" y2="9"/>
    </svg>
  )},
  { id: 'sprint', label: 'Sprint', icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  )},
  { id: 'inbox', label: 'Hop thu den', icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
    </svg>
  )},
  { id: 'planner', label: 'Lap ke hoach', icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )},
  { id: 'chat', label: 'Chat nhom', icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )},
  { id: 'finance', label: 'Ngan sach', icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  )},
  { id: 'report', label: 'Bao cao', icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
    </svg>
  )},
]

export default function Sidebar({ open, activeTab, setActiveTab, selectedProject, onSelectProject, isAdmin }) {
  return (
    <aside className={'sidebar ' + (open ? 'sidebar-open' : '')}>
      <div className="sidebar-section-label">WORKSPACE</div>

      {NAV_ITEMS.map(item => (
        <button key={item.id}
          className={'sidebar-item ' + (activeTab === item.id ? 'active' : '')}
          onClick={() => setActiveTab(item.id)}>
          {item.icon}
          {item.label}
        </button>
      ))}

      {isAdmin && (
        <>
          <div className="sidebar-divider" />
          <div className="sidebar-section-label">QUAN TRI</div>
          <button
            className={'sidebar-item admin-item ' + (activeTab === 'admin' ? 'active' : '')}
            onClick={() => setActiveTab('admin')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
            </svg>
            Quan tri he thong
          </button>
        </>
      )}

      <div className="sidebar-divider" />
      <div className="sidebar-section-label">DU AN HIEN TAI</div>

      {selectedProject ? (
        <button className="sidebar-item" onClick={onSelectProject}>
          <span className="sidebar-board-dot" />
          {selectedProject.name}
        </button>
      ) : (
        <div style={{ padding: '4px 16px', fontSize: 12, color: 'var(--text-faint)' }}>
          Chua chon du an
        </div>
      )}
    </aside>
  )
}
