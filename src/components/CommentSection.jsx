import { useState, useEffect } from 'react'
import { getCommentsAPI, createCommentAPI, deleteCommentAPI } from '../services/commentService'
import { useAuth } from '../hooks/useAuth'

function timeAgo(date) {
  const diff  = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'Vừa xong'
  if (mins < 60)  return `${mins} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  return `${days} ngày trước`
}

export default function CommentSection({ cardId }) {
  const { user }                  = useAuth()
  const [comments, setComments]   = useState([])
  const [content, setContent]     = useState('')
  const [loading, setLoading]     = useState(true)
  const [sending, setSending]     = useState(false)

  useEffect(() => {
    if (!cardId) return
    getCommentsAPI(cardId)
      .then(res => setComments(res.data?.data || res.data || []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false))
  }, [cardId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setSending(true)
    try {
      const res     = await createCommentAPI(cardId, content.trim())
      const newComment = res.data?.data || res.data
      setComments(prev => [...prev, newComment])
      setContent('')
    } catch (err) {
      alert('Lỗi gửi bình luận')
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xoá bình luận này?')) return
    try {
      await deleteCommentAPI(id)
      setComments(prev => prev.filter(c => c._id !== id))
    } catch {
      alert('Lỗi xoá bình luận')
    }
  }

  return (
    <div className="comment-section">
      <div className="comment-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        Bình luận ({comments.length})
      </div>

      {/* Danh sách comment */}
      <div className="comment-list">
        {loading ? (
          <div className="comment-loading">Đang tải...</div>
        ) : comments.length === 0 ? (
          <div className="comment-empty">Chưa có bình luận nào.</div>
        ) : comments.map(c => (
          <div key={c._id} className="comment-item">
            <div className="comment-avatar">
              {(c.user?.name || '?')[0].toUpperCase()}
            </div>
            <div className="comment-body">
              <div className="comment-header">
                <span className="comment-author">{c.user?.name || 'Ẩn danh'}</span>
                <span className="comment-time">{timeAgo(c.createdAt)}</span>
                {c.user?._id === user?._id && (
                  <button className="comment-delete" onClick={() => handleDelete(c._id)}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6 6 18M6 6l12 12"/>
                    </svg>
                  </button>
                )}
              </div>
              <div className="comment-content">{c.content}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Form thêm comment */}
      <form className="comment-form" onSubmit={handleSubmit}>
        <div className="comment-input-avatar">
          {(user?.name || '?')[0].toUpperCase()}
        </div>
        <input
          className="comment-input"
          placeholder="Viết bình luận..."
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <button type="submit" className="comment-send" disabled={sending || !content.trim()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
    </div>
  )
}
