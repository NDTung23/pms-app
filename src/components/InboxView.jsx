import { useState, useEffect } from 'react'
import {
  getNotificationsAPI,
  markReadAPI,
  markAllReadAPI,
  deleteNotificationAPI,
} from '../services/notificationService'

const typeIcon = {
  assigned:  '👤',
  deadline:  '⏰',
  comment:   '💬',
  system:    '🔔',
  default:   '📌',
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)

  if (mins < 1)   return 'Vừa xong'
  if (mins < 60)  return `${mins} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  if (days < 7)   return `${days} ngày trước`
  return new Date(date).toLocaleDateString('vi-VN')
}

export default function InboxView() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    getNotificationsAPI()
      .then(res => setMessages(res.data?.data || res.data || []))
      .catch(err => console.error('Lỗi load notifications:', err))
      .finally(() => setLoading(false))
  }, [])

  const unreadCount = messages.filter(m => !m.isRead).length

  const handleMarkRead = async (id) => {
    try {
      await markReadAPI(id)
      setMessages(prev => prev.map(m => m._id === id ? { ...m, isRead: true } : m))
    } catch {}
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllReadAPI()
      setMessages(prev => prev.map(m => ({ ...m, isRead: true })))
    } catch {}
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    try {
      await deleteNotificationAPI(id)
      setMessages(prev => prev.filter(m => m._id !== id))
    } catch {}
  }

  if (loading) return <div className="board-loading">Đang tải thông báo...</div>

  return (
    <div className="view-container">
      <div className="subheader">
        <span className="board-title">Hộp thư đến</span>
        <div className="subheader-actions">
          {unreadCount > 0 && (
            <>
              <span className="sh-btn">{unreadCount} chưa đọc</span>
              <button className="sh-btn" onClick={handleMarkAllRead}>
                Đánh dấu tất cả đã đọc
              </button>
            </>
          )}
        </div>
      </div>

      <div className="inbox-list">
        {messages.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px', fontSize: 14 }}>
            Chưa có thông báo nào.
          </div>
        ) : messages.map(msg => (
          <div
            key={msg._id}
            className={`inbox-item ${msg.isRead ? '' : 'unread'}`}
            onClick={() => !msg.isRead && handleMarkRead(msg._id)}
          >
            <div className="inbox-avatar" style={{ fontSize: 16, background: 'rgba(37,99,235,.2)' }}>
              {typeIcon[msg.type] || typeIcon.default}
            </div>
            <div className="inbox-content">
              <div className="inbox-from">
                {msg.title}
                <span className="inbox-time">{timeAgo(msg.createdAt)}</span>
              </div>
              <div className="inbox-msg">{msg.body}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {!msg.isRead && <div className="inbox-dot" />}
              <button
                className="project-action-btn delete"
                onClick={e => handleDelete(e, msg._id)}
                title="Xoá"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
