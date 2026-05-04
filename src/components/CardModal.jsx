import { useState, useEffect } from 'react'
import { LABEL_COLORS } from '../data'
import CommentSection from './CommentSection'

const PRIORITY_OPTIONS = [
  { value: 'urgent', label: 'Khẩn cấp' },
  { value: 'high',   label: 'Cao' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'low',    label: 'Thấp' },
]

export default function CardModal({ card, listId, lists, onSave, onDelete, onClose }) {
  const isNew = !card

  const [form, setForm] = useState({
    title:       card?.title                       || '',
    description: card?.description                 || '',
    labelColor:  card?.labelColor || card?.label   || 'blue',
    tag:         card?.tag                         || '',
    dueDate:     card?.dueDate ? card.dueDate.slice(0, 10) : '',
    priority:    card?.priority                    || 'medium',
    listId:      listId,
  })

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSave = () => {
    if (!form.title.trim()) return
    onSave({
      ...card,
      title:       form.title,
      description: form.description,
      labelColor:  form.labelColor,
      tag:         form.tag,
      dueDate:     form.dueDate || null,
      priority:    form.priority,
    }, form.listId)
    onClose()
  }

  const handleDelete = () => {
    if (window.confirm('Xoá thẻ này?')) {
      onDelete(card._id || card.id, listId)
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-wide">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{isNew ? 'Thêm thẻ mới' : 'Chi tiết thẻ'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="modal-label-strip"
          style={{ background: LABEL_COLORS.find(l => l.id === form.labelColor)?.bg }} />

        <div className="modal-content-split">
          {/* Cột trái: form */}
          <div className="modal-body modal-left">
            <div className="modal-field">
              <label className="modal-label">Tiêu đề *</label>
              <input
                className="modal-input"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="Nhập tiêu đề thẻ..."
                autoFocus
              />
            </div>

            <div className="modal-field">
              <label className="modal-label">Mô tả</label>
              <textarea
                className="modal-input modal-textarea"
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Thêm mô tả chi tiết..."
                rows={3}
              />
            </div>

            <div className="modal-row">
              <div className="modal-field" style={{ flex: 1 }}>
                <label className="modal-label">Tag</label>
                <input
                  className="modal-input"
                  value={form.tag}
                  onChange={e => set('tag', e.target.value)}
                  placeholder="Dev, Design..."
                />
              </div>
              <div className="modal-field" style={{ flex: 1 }}>
                <label className="modal-label">Deadline</label>
                <input
                  className="modal-input"
                  type="date"
                  value={form.dueDate}
                  onChange={e => set('dueDate', e.target.value)}
                />
              </div>
            </div>

            <div className="modal-row">
              <div className="modal-field" style={{ flex: 1 }}>
                <label className="modal-label">Độ ưu tiên</label>
                <select className="modal-input" value={form.priority} onChange={e => set('priority', e.target.value)}>
                  {PRIORITY_OPTIONS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div className="modal-field" style={{ flex: 1 }}>
                <label className="modal-label">Cột</label>
                <select className="modal-input" value={form.listId} onChange={e => set('listId', e.target.value)}>
                  {lists.map(l => (
                    <option key={l._id || l.id} value={l._id || l.id}>{l.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-field">
              <label className="modal-label">Màu nhãn</label>
              <div className="label-picker">
                {LABEL_COLORS.map(lc => (
                  <button
                    key={lc.id}
                    className={`label-swatch ${form.labelColor === lc.id ? 'selected' : ''}`}
                    style={{ background: lc.bg }}
                    onClick={() => set('labelColor', lc.id)}
                    title={lc.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Cột phải: comments (chỉ hiện khi sửa, không phải tạo mới) */}
          {!isNew && card._id && (
            <div className="modal-right">
              <CommentSection cardId={card._id} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {!isNew && (
            <button className="btn-danger" onClick={handleDelete}>Xoá thẻ</button>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn-ghost" onClick={onClose}>Huỷ</button>
            <button className="btn-primary" onClick={handleSave}>
              {isNew ? 'Thêm thẻ' : 'Lưu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
