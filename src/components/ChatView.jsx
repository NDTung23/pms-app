import { useState, useEffect, useRef } from 'react'
import { getChannelsAPI, createChannelAPI, deleteChannelAPI, getMessagesAPI, sendMessageAPI, deleteMessageAPI } from '../services/chatService'
import { useAuth } from '../hooks/useAuth'

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Vừa xong'
  if (mins < 60) return `${mins}p`
  if (mins < 1440) return `${Math.floor(mins/60)}h`
  return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

export default function ChatView({ projectId }) {
  const { user }                        = useAuth()
  const [channels, setChannels]         = useState([])
  const [activeChannel, setActive]      = useState(null)
  const [messages, setMessages]         = useState([])
  const [content, setContent]           = useState('')
  const [loading, setLoading]           = useState(true)
  const [sending, setSending]           = useState(false)
  const [showNewChannel, setShowNew]    = useState(false)
  const [newChName, setNewChName]       = useState('')
  const bottomRef                       = useRef(null)
  const pollRef                         = useRef(null)

  useEffect(() => {
    if (!projectId) return
    getChannelsAPI(projectId)
      .then(r => {
        const chs = r.data?.data || []
        setChannels(chs)
        if (chs.length > 0) setActive(chs[0])
      })
      .finally(() => setLoading(false))
  }, [projectId])

  // Load messages khi đổi channel
  useEffect(() => {
    if (!activeChannel) return
    getMessagesAPI(activeChannel._id)
      .then(r => setMessages(r.data?.data || []))

    // Poll mỗi 5 giây
    clearInterval(pollRef.current)
    pollRef.current = setInterval(() => {
      getMessagesAPI(activeChannel._id)
        .then(r => setMessages(r.data?.data || []))
    }, 5000)
    return () => clearInterval(pollRef.current)
  }, [activeChannel])

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!content.trim() || !activeChannel) return
    setSending(true)
    try {
      const r = await sendMessageAPI(activeChannel._id, { content: content.trim() })
      setMessages(prev => [...prev, r.data?.data || r.data])
      setContent('')
    } catch { alert('Lỗi gửi tin nhắn') }
    finally { setSending(false) }
  }

  const handleDelete = async (id) => {
    try {
      await deleteMessageAPI(id)
      setMessages(prev => prev.filter(m => m._id !== id))
    } catch { alert('Lỗi xoá tin nhắn') }
  }

  const handleCreateChannel = async (e) => {
    e.preventDefault()
    if (!newChName.trim()) return
    try {
      const r = await createChannelAPI({ projectId, name: newChName.trim() })
      const ch = r.data?.data || r.data
      setChannels(prev => [...prev, ch])
      setActive(ch)
      setShowNew(false); setNewChName('')
    } catch { alert('Lỗi tạo kênh') }
  }

  const handleDeleteChannel = async (ch) => {
    if (!window.confirm(`Xoá kênh "${ch.name}"?`)) return
    try {
      await deleteChannelAPI(ch._id)
      const remaining = channels.filter(c => c._id !== ch._id)
      setChannels(remaining)
      setActive(remaining[0] || null)
    } catch { alert('Lỗi xoá kênh') }
  }

  if (!projectId) return <div style={{ padding: 40, color: 'var(--text-muted)', textAlign: 'center' }}>Vui lòng chọn dự án</div>
  if (loading) return <div className="board-loading">Đang tải chat...</div>

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
      {/* Sidebar channels */}
      <div style={{ width: 220, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--sidebar)', flexShrink: 0 }}>
        <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Kênh chat</span>
          <button onClick={() => setShowNew(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 18, lineHeight: 1 }}>+</button>
        </div>

        {showNew && (
          <form onSubmit={handleCreateChannel} style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>
            <input className="modal-input" value={newChName} onChange={e => setNewChName(e.target.value)}
              placeholder="Tên kênh..." autoFocus style={{ marginBottom: 6, fontSize: 12 }} />
            <div style={{ display: 'flex', gap: 4 }}>
              <button type="submit" className="btn-primary" style={{ flex: 1, fontSize: 12, padding: '4px 8px' }}>Tạo</button>
              <button type="button" className="btn-ghost" style={{ flex: 1, fontSize: 12, padding: '4px 8px' }} onClick={() => setShowNew(false)}>Huỷ</button>
            </div>
          </form>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
          {channels.length === 0
            ? <div style={{ fontSize: 12, color: 'var(--text-faint)', padding: '12px 6px' }}>Chưa có kênh nào</div>
            : channels.map(ch => (
              <div key={ch._id} onClick={() => setActive(ch)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '7px 10px', borderRadius: 7, cursor: 'pointer', marginBottom: 2,
                background: activeChannel?._id === ch._id ? 'rgba(37,99,235,.15)' : 'transparent',
                color: activeChannel?._id === ch._id ? 'var(--accent)' : 'var(--text-muted)',
              }}>
                <span style={{ fontSize: 13 }}># {ch.name}</span>
                <button onClick={e => { e.stopPropagation(); handleDeleteChannel(ch) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: .5, color: 'inherit', padding: 0, fontSize: 12 }}>✕</button>
              </div>
            ))
          }
        </div>
      </div>

      {/* Message area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!activeChannel ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            Chọn kênh để bắt đầu chat
          </div>
        ) : (
          <>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 14 }}>
              # {activeChannel.name}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.length === 0
                ? <div style={{ color: 'var(--text-faint)', textAlign: 'center', fontSize: 13, marginTop: 40 }}>Chưa có tin nhắn nào. Hãy bắt đầu!</div>
                : messages.map(m => {
                  const isMe = m.sender?._id === user?._id
                  return (
                    <div key={m._id} style={{ display: 'flex', gap: 10, flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                        {(m.sender?.name || '?')[0].toUpperCase()}
                      </div>
                      <div style={{ maxWidth: '65%' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexDirection: isMe ? 'row-reverse' : 'row', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{m.sender?.name}</span>
                          <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>{timeAgo(m.createdAt)}</span>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <div style={{ background: isMe ? 'var(--accent)' : 'var(--card)', color: isMe ? '#fff' : 'var(--text)',
                            padding: '8px 12px', borderRadius: isMe ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                            fontSize: 13, lineHeight: 1.5, border: isMe ? 'none' : '1px solid var(--border)' }}>
                            {m.content}
                          </div>
                          {isMe && (
                            <button onClick={() => handleDelete(m._id)} style={{
                              position: 'absolute', top: -6, right: -6, background: '#ef4444', border: 'none',
                              borderRadius: '50%', width: 16, height: 16, cursor: 'pointer', color: '#fff',
                              fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8
                            }}>✕</button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              }
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <input className="modal-input" style={{ flex: 1, margin: 0 }}
                placeholder={`Nhắn vào #${activeChannel.name}...`}
                value={content} onChange={e => setContent(e.target.value)} />
              <button type="submit" className="btn-primary" disabled={sending || !content.trim()} style={{ flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
