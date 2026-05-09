import { useState, useEffect } from 'react'
import { LABEL_COLORS } from '../data'
import CommentSection from './CommentSection'

const PRIORITY_OPTIONS = [
  { value: 'urgent', label: 'Khan cap' },
  { value: 'high',   label: 'Cao' },
  { value: 'medium', label: 'Trung binh' },
  { value: 'low',    label: 'Thap' },
]
const STATUS_OPTIONS = [
  { value: 'todo',        label: 'Chua lam' },
  { value: 'in_progress', label: 'Dang lam' },
  { value: 'done',        label: 'Xong' },
]

export default function CardModal({ card, listId, lists, onSave, onDelete, onClose, projectMembers, canEdit }) {
  const isNew     = !card
  const editable  = canEdit !== false

  const [form, setForm] = useState({
    title:       card?.title       || '',
    description: card?.description || '',
    labelColor:  card?.labelColor || card?.label || 'blue',
    tag:         card?.tag         || '',
    dueDate:     card?.dueDate ? card.dueDate.slice(0,10) : '',
    priority:    card?.priority    || 'medium',
    status:      card?.status      || 'todo',
    storyPoints: card?.storyPoints || 0,
    listId,
  })

  const [checklist,    setChecklist]    = useState(card?.checklist    || [])
  const [attachments,  setAttachments]  = useState(card?.attachments  || [])
  const [newItem,      setNewItem]      = useState('')
  const [attUrl,       setAttUrl]       = useState('')
  const [attName,      setAttName]      = useState('')
  const [activeTab,    setActiveTab]    = useState('details')

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.title.trim()) return
    onSave({ ...card, ...form, checklist, attachments }, form.listId)
    onClose()
  }

  const handleDelete = () => {
    if (window.confirm('Xoa the nay?')) { onDelete(card._id || card.id, listId); onClose() }
  }

  // Checklist
  const addCheckItem = (e) => {
    e.preventDefault()
    if (!newItem.trim()) return
    setChecklist(prev => [...prev, { _id: Date.now().toString(), text: newItem.trim(), completed: false }])
    setNewItem('')
  }
  const toggleCheck  = (id) => setChecklist(prev => prev.map(c => c._id === id ? { ...c, completed: !c.completed } : c))
  const removeCheck  = (id) => setChecklist(prev => prev.filter(c => c._id !== id))
  const checkPct     = checklist.length > 0 ? Math.round(checklist.filter(c => c.completed).length / checklist.length * 100) : 0

  // Attachments
  const addAttachment = (e) => {
    e.preventDefault()
    if (!attUrl.trim()) return
    setAttachments(prev => [...prev, { _id: Date.now().toString(), name: attName.trim() || attUrl.split('/').pop(), url: attUrl.trim() }])
    setAttUrl(''); setAttName('')
  }
  const removeAttachment = (id) => setAttachments(prev => prev.filter(a => a._id !== id))

  const tabs = [
    { id: 'details',     label: 'Chi tiet' },
    { id: 'checklist',   label: 'Checklist ' + (checklist.length ? checklist.filter(c=>c.completed).length + '/' + checklist.length : '') },
    { id: 'attachments', label: 'Dinh kem' + (attachments.length ? ' (' + attachments.length + ')' : '') },
    ...(!isNew && card?._id ? [{ id: 'comments', label: 'Binh luan' }] : []),
  ]

  const labelBg = LABEL_COLORS.find(l => l.id === form.labelColor)?.bg

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-wide">
        <div className="modal-header">
          <h2 className="modal-title">{isNew ? 'Them the moi' : editable ? 'Chi tiet the' : 'Xem the'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="modal-label-strip" style={{ background: labelBg }} />

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ padding: '8px 14px', fontSize: 12, border: 'none', background: 'none', cursor: 'pointer',
                color: activeTab === t.id ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -1, fontWeight: activeTab === t.id ? 600 : 400, whiteSpace: 'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="modal-body" style={{ minHeight: 300 }}>

          {/* DETAILS */}
          {activeTab === 'details' && (
            <>
              <div className="modal-field">
                <label className="modal-label">Tieu de *</label>
                <input className="modal-input" value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="Nhap tieu de..." autoFocus disabled={!editable} />
              </div>
              <div className="modal-field">
                <label className="modal-label">Mo ta</label>
                <textarea className="modal-input modal-textarea" rows={3} value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Mo ta chi tiet..." disabled={!editable} />
              </div>
              <div className="modal-row">
                <div className="modal-field" style={{ flex: 1 }}>
                  <label className="modal-label">Tag</label>
                  <input className="modal-input" value={form.tag}
                    onChange={e => set('tag', e.target.value)} placeholder="Dev, Design..." disabled={!editable} />
                </div>
                <div className="modal-field" style={{ flex: 1 }}>
                  <label className="modal-label">Deadline</label>
                  <input className="modal-input" type="date" value={form.dueDate}
                    onChange={e => set('dueDate', e.target.value)} disabled={!editable} />
                </div>
              </div>
              <div className="modal-row">
                <div className="modal-field" style={{ flex: 1 }}>
                  <label className="modal-label">Do uu tien</label>
                  <select className="modal-input" value={form.priority}
                    onChange={e => set('priority', e.target.value)} disabled={!editable}>
                    {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div className="modal-field" style={{ flex: 1 }}>
                  <label className="modal-label">Trang thai</label>
                  <select className="modal-input" value={form.status}
                    onChange={e => set('status', e.target.value)} disabled={!editable}>
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-row">
                <div className="modal-field" style={{ flex: 1 }}>
                  <label className="modal-label">Cot</label>
                  <select className="modal-input" value={form.listId}
                    onChange={e => set('listId', e.target.value)} disabled={!editable}>
                    {lists.map(l => <option key={l._id || l.id} value={l._id || l.id}>{l.title}</option>)}
                  </select>
                </div>
                <div className="modal-field" style={{ flex: 1 }}>
                  <label className="modal-label">Story Points</label>
                  <input className="modal-input" type="number" min="0" value={form.storyPoints}
                    onChange={e => set('storyPoints', parseInt(e.target.value)||0)} disabled={!editable} />
                </div>
              </div>
              {editable && (
                <div className="modal-field">
                  <label className="modal-label">Mau nhan</label>
                  <div className="label-picker">
                    {LABEL_COLORS.map(lc => (
                      <button key={lc.id}
                        className={'label-swatch' + (form.labelColor === lc.id ? ' selected' : '')}
                        style={{ background: lc.bg }} onClick={() => set('labelColor', lc.id)} title={lc.name} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* CHECKLIST */}
          {activeTab === 'checklist' && (
            <div>
              {checklist.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12,
                    color: 'var(--text-muted)', marginBottom: 6 }}>
                    <span>Tien do</span><span>{checkPct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 999 }}>
                    <div style={{ height: '100%', borderRadius: 999, width: checkPct + '%',
                      background: checkPct === 100 ? '#22c55e' : '#3b82f6', transition: 'width .3s' }} />
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {checklist.length === 0
                  ? <div style={{ color: 'var(--text-faint)', fontSize: 13, textAlign: 'center', padding: 20 }}>Chua co muc nao</div>
                  : checklist.map(item => (
                  <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }}>
                    <input type="checkbox" checked={item.completed} onChange={() => toggleCheck(item._id)}
                      style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--accent)' }} />
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--text)',
                      textDecoration: item.completed ? 'line-through' : 'none', opacity: item.completed ? .6 : 1 }}>
                      {item.text}
                    </span>
                    {editable && (
                      <button onClick={() => removeCheck(item._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: 14 }}>
                        x
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {editable && (
                <form onSubmit={addCheckItem} style={{ display: 'flex', gap: 8 }}>
                  <input className="modal-input" style={{ flex: 1, margin: 0 }}
                    value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Them muc moi..." />
                  <button type="submit" className="btn-primary" style={{ flexShrink: 0 }}>Them</button>
                </form>
              )}
            </div>
          )}

          {/* ATTACHMENTS */}
          {activeTab === 'attachments' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {attachments.length === 0
                  ? <div style={{ color: 'var(--text-faint)', fontSize: 13, textAlign: 'center', padding: 20 }}>Chua co tep dinh kem</div>
                  : attachments.map(att => (
                  <div key={att._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }}>
                    <div style={{ fontSize: 20 }}>clip</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</div>
                      <a href={att.url} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 11, color: 'var(--accent)', overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{att.url}</a>
                    </div>
                    {editable && (
                      <button onClick={() => removeAttachment(att._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}>x</button>
                    )}
                  </div>
                ))}
              </div>
              {editable && (
                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>Them duong dan tep</div>
                  <form onSubmit={addAttachment} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input className="modal-input" style={{ margin: 0 }} value={attName}
                      onChange={e => setAttName(e.target.value)} placeholder="Ten tep (tuy chon)" />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input className="modal-input" style={{ flex: 1, margin: 0 }} value={attUrl}
                        onChange={e => setAttUrl(e.target.value)} placeholder="https://..." required />
                      <button type="submit" className="btn-primary" style={{ flexShrink: 0 }}>Them</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* COMMENTS */}
          {activeTab === 'comments' && !isNew && card?._id && (
            <CommentSection cardId={card._id} projectMembers={projectMembers} />
          )}
        </div>

        <div className="modal-footer">
          {!isNew && editable && (
            <button className="btn-danger" onClick={handleDelete}>Xoa the</button>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn-ghost" onClick={onClose}>{editable ? 'Huy' : 'Dong'}</button>
            {editable && (
              <button className="btn-primary" onClick={handleSave}>{isNew ? 'Them the' : 'Luu'}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
