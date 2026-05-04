const TABS = [
  { id: 'inbox',   label: 'Hộp thư đến' },
  { id: 'planner', label: 'Trình lập kế hoạch' },
  { id: 'board',   label: 'Bảng thông tin' },
  { id: 'report',  label: 'Báo cáo & thống kê' },
]

export default function TabBar({ activeTab, setActiveTab }) {
  return (
    <div className="tabbar">
      {TABS.map((tab, i) => (
        <span key={tab.id} style={{ display: 'flex', alignItems: 'center' }}>
          {i > 0 && <div className="tab-divider" />}
          <button
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        </span>
      ))}
    </div>
  )
}
