const PRIORITIES = [
  { value: 'urgent', label: 'Khẩn cấp', color: '#ef4444' },
  { value: 'high',   label: 'Cao',       color: '#f59e0b' },
  { value: 'medium', label: 'Trung bình',color: '#3b82f6' },
  { value: 'low',    label: 'Thấp',      color: '#22c55e' },
]

const DEADLINES = [
  { value: 'overdue', label: '⚠️ Quá hạn' },
  { value: 'today',   label: '📅 Hôm nay' },
  { value: 'week',    label: '📆 Tuần này' },
  { value: 'none',    label: '⬜ Chưa có deadline' },
]

export default function FilterPanel({ filters, onChange, onClose, allTags }) {
  const toggle = (key, value) => {
    const current = filters[key] || []
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    onChange({ ...filters, [key]: next })
  }

  const hasFilters =
    (filters.priorities?.length > 0) ||
    (filters.deadlines?.length > 0)  ||
    (filters.tags?.length > 0)       ||
    filters.search

  const clearAll = () => onChange({ priorities: [], deadlines: [], tags: [], search: '' })

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <span className="filter-title">Bộ lọc</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {hasFilters && (
            <button className="filter-clear" onClick={clearAll}>Xoá tất cả</button>
          )}
          <button className="modal-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Tìm kiếm */}
      <div className="filter-section">
        <div className="filter-section-title">Tìm kiếm</div>
        <input
          className="modal-input"
          placeholder="Tìm theo tên thẻ..."
          value={filters.search || ''}
          onChange={e => onChange({ ...filters, search: e.target.value })}
        />
      </div>

      {/* Độ ưu tiên */}
      <div className="filter-section">
        <div className="filter-section-title">Độ ưu tiên</div>
        <div className="filter-chips">
          {PRIORITIES.map(p => (
            <button
              key={p.value}
              className={`filter-chip ${filters.priorities?.includes(p.value) ? 'active' : ''}`}
              style={filters.priorities?.includes(p.value) ? {
                background: p.color + '22',
                borderColor: p.color,
                color: p.color,
              } : {}}
              onClick={() => toggle('priorities', p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deadline */}
      <div className="filter-section">
        <div className="filter-section-title">Deadline</div>
        <div className="filter-chips">
          {DEADLINES.map(d => (
            <button
              key={d.value}
              className={`filter-chip ${filters.deadlines?.includes(d.value) ? 'active' : ''}`}
              onClick={() => toggle('deadlines', d.value)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="filter-section">
          <div className="filter-section-title">Tag</div>
          <div className="filter-chips">
            {allTags.map(tag => (
              <button
                key={tag}
                className={`filter-chip ${filters.tags?.includes(tag) ? 'active' : ''}`}
                onClick={() => toggle('tags', tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
