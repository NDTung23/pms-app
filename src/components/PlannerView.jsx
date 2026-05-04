import { useState, useEffect } from 'react'
import { getPlannerCardsAPI } from '../services/reportService'

const priorityColor = {
  urgent: '#ef4444',
  high:   '#f59e0b',
  medium: '#3b82f6',
  low:    '#22c55e',
}

const priorityLabel = {
  urgent: 'Khẩn cấp',
  high:   'Cao',
  medium: 'Trung bình',
  low:    'Thấp',
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('vi-VN', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

function isOverdue(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(date) < today
}

function isToday(date) {
  return new Date(date).toDateString() === new Date().toDateString()
}

function groupCards(cards) {
  // Thứ tự hiển thị cố định
  const groups = {
    'overdue': [],
    'today':   [],
  }

  cards.forEach(card => {
    if (isOverdue(card.dueDate)) {
      groups['overdue'].push(card)
    } else if (isToday(card.dueDate)) {
      groups['today'].push(card)
    } else {
      const key = new Date(card.dueDate).toISOString().slice(0, 10)
      if (!groups[key]) groups[key] = []
      groups[key].push(card)
    }
  })

  return groups
}

const GROUP_LABELS = {
  overdue: '⚠️ Quá hạn',
  today:   '📅 Hôm nay',
}

export default function PlannerView() {
  const [cards, setCards]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPlannerCardsAPI()
      .then(res => setCards(res.data?.data || res.data || []))
      .catch(err => console.error('Lỗi load planner:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="board-loading">Đang tải kế hoạch...</div>

  const grouped = groupCards(cards)

  // Lọc bỏ nhóm rỗng
  const entries = Object.entries(grouped).filter(([, cards]) => cards.length > 0)

  return (
    <div className="view-container">
      <div className="subheader">
        <span className="board-title">Trình lập kế hoạch</span>
        <div className="subheader-actions">
          <span className="sh-btn">{cards.length} thẻ có deadline</span>
        </div>
      </div>

      <div className="planner-list">
        {entries.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px', fontSize: 14 }}>
            Chưa có thẻ nào có deadline. Hãy thêm deadline cho thẻ trong Board!
          </div>
        ) : entries.map(([key, cards]) => (
          <div key={key} className="planner-group">
            <div className={`planner-date-label ${key === 'overdue' ? 'planner-label-overdue' : key === 'today' ? 'planner-label-today' : ''}`}>
              {GROUP_LABELS[key] || formatDate(key)}
            </div>
            {cards.map(card => (
              <div key={card._id} className={`planner-card ${key === 'overdue' ? 'planner-card-overdue' : ''}`}>
                <div
                  className="planner-dot"
                  style={{ background: priorityColor[card.priority] || '#3b82f6' }}
                />
                <div style={{ flex: 1 }}>
                  <div className="planner-card-title">{card.title}</div>
                  <div className="planner-card-sub">
                    {card.list?.title}{card.tag ? ` · ${card.tag}` : ''}
                  </div>
                </div>
                <span className="card-tag" style={{
                  background: priorityColor[card.priority] + '22',
                  color:      priorityColor[card.priority],
                  border:     `1px solid ${priorityColor[card.priority]}44`,
                }}>
                  {priorityLabel[card.priority] || card.priority}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
