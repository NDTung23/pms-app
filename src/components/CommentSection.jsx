import { useState, useEffect, useRef } from 'react'
import { getCommentsAPI, createCommentAPI, deleteCommentAPI } from '../services/commentService'
import { useAuth } from '../hooks/useAuth'

function timeAgo(date) {
  const diff  = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'Vừa xong'
  if (mins < 60)  return mins + ' phút trước'
  if (hours < 24) return hours + ' giờ trước'
  return days + ' ngày trước'
}

export default function CommentSection({ cardId, projectMembers }) {
  const members = projectMembers || []
  const { user }                  = useAuth()
  const [comments, setComments]   = useState([])
  const [content, setContent]     = useState('')
  const [loading, setLoading]     = useState(true)
  const [sending, setSending]     = useState(false)
  const [showMention, setShowMention] = useState(false)
  const [mentionList, setMentionList] = useState([])
  const [mentions, setMentions]   = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    if (!cardId) return
    getCommentsAPI(cardId)
      .then(res => setComments(res.data?.data || []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false))
  }, [cardId])

  const handleInput = (e) => {
    const val = e.target.value
    setContent(val)
    const atIdx = val.lastIndexOf('@')
    if (atIdx !== -1) {
      const q = val.slice(atIdx + 1).toLowerCase()
      const filtered = members.filter(m =>
        m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q)
      )
      setMentionList(filtered.slice(0, 6))
      setShowMention(filtered.length > 0)
    } else {
      setShowMention(false)
    }
  }

  const selectMention = (member) => {
    const atIdx = content.lastIndexOf('@')
    setContent(content.slice(0, atIdx) + '@' + member.name + ' ')
    setMentions(prev => [...new Set([...prev, member._id])])
    setShowMention(false)
    inputRef.current?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setSending(true)
    try {
      const res = await createCommentAPI(cardId, content.trim(), mentions)
      setComments(prev => [...prev, res.data?.data || res.data])
      setContent('')
      setMentions([])
    } catch { alert('Lỗi gửi bình luận') }
    finally { setSending(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xoá bình luận này?')) return
    try {
      await deleteCommentAPI(id)
      setComments(prev => prev.filter(c => c._id !== id))
    } catch { alert('Lỗi xoá bình luận') }
  }

  return (
    <div className="comment-section">
      <div className="comment-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        Bình luận ({comments.length})
      </div>

      <div className="comment-list">
        {loading ? (
          <div className="comment-loading">Đang tải...</div>
        ) : comments.length === 0 ? (
          <div className="comment-empty">Chưa có bình luận nào.</div>
        ) : comments.map(c => (
          <div key={c._id} className="comment-item">
            <div className="comment-avatar">{(c.user?.name || '?')[0].toUpperCase()}</div>
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
              <div className="comment-content">
                {c.content.split(/(@\S+)/g).map((part, i) =>
                  part.startsWith('@')
                    ? <span key={i} style={{ color: 'var(--accent)', fontWeight: 600 }}>{part}</span>
                    : <span key={i}>{part}</span>
                )}
              </div>
              {c.mentions?.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                  {c.mentions.map(m => (
                    <span key={m._id || m} style={{ fontSize: 10, background: 'rgba(37,99,235,.15)',
                      color: 'var(--accent)', padding: '1px 6px', borderRadius: 20 }}>
                      @{m.name || m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ position: 'relative' }}>
        {showMention && mentionList.length > 0 && (
          <div style={{ position: 'absolute', bottom: 'calc(100% + 4px)', left: 0, right: 0,
            background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,.3)', zIndex: 100, overflow: 'hidden' }}>
            <div style={{ padding: '5px 10px', fontSize: 11, color: 'var(--text-faint)',
              borderBottom: '1px solid var(--border)' }}>Tag thành viên</div>
            {mentionList.map(m => (
              <button key={m._id} onClick={() => selectMention(m)}
                style={{ width: '100%', padding: '8px 10px', background: 'none', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 700 }}>
                  {(m.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{m.email}</div>
                </div>
              </button>
            ))}
          </div>
        )}
        <form className="comment-form" onSubmit={handleSubmit}>
          <div className="comment-input-avatar">{(user?.name || '?')[0].toUpperCase()}</div>
          <input ref={inputRef} className="comment-input"
            placeholder="Viết bình luận... dùng @ để tag thành viên"
            value={content} onChange={handleInput}
            onKeyDown={e => { if (e.key === 'Escape') setShowMention(false) }} />
          <button type="submit" className="comment-send" disabled={sending || !content.trim()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
