const TABS = [
  { id: 'inbox',   label: 'Hộp thư đến' },
  { id: 'planner', label: 'Trình lập kế hoạch' },
  { id: 'board',   label: 'Bảng thông tin' },
  { id: 'report',  label: 'Báo cáo & thống kê' },
]

export default function TabBar({ activeTab, setActiveTab }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      padding: '0 16px 8px',
      background: 'var(--navbar, rgba(13,18,33,.95))',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--glass-border, rgba(255,255,255,.10))',
      zIndex: 900,
    }}>
      {TABS.map((tab, i) => (
        <span key={tab.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {i > 0 && (
            <div style={{
              width: 1,
              height: 16,
              background: 'var(--border, rgba(255,255,255,.12))',
              flexShrink: 0,
            }} />
          )}
          <button
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? 'var(--accent, #3b82f6)' : 'var(--text-muted, #94a3b8)',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, rgba(59,130,246,.22), rgba(124,58,237,.14))'
                : 'none',
              border: activeTab === tab.id
                ? '1px solid rgba(59,130,246,.28)'
                : '1px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all .18s ease',
            }}
          >
            {tab.label}
          </button>
        </span>
      ))}
    </div>
  )
}
