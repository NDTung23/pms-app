import { useState, useEffect, useRef, useMemo } from 'react'
import { LABEL_COLORS } from '../data'
import CardModal from './CardModal'
import FilterPanel from './FilterPanel'
import { useAuth } from '../hooks/useAuth'
import {
  getListsAPI, getCardsAPI, createListAPI, updateListAPI, deleteListAPI,
  createCardAPI, updateCardAPI, deleteCardAPI, moveCardAPI,
  getBoardsAPI, createBoardAPI,
} from '../services/boardService'
import { getProjectAPI } from '../services/projectService'

const labelColor = id => LABEL_COLORS.find(l => l.id === id)?.bg || '#3b82f6'

const priorityBadge = {
  urgent: { bg: '#fee2e2', color: '#991b1b', label: 'Khẩn cấp' },
  high:   { bg: '#fef3c7', color: '#92400e', label: 'Cao' },
  medium: { bg: '#dbeafe', color: '#1e40af', label: 'Trung bình' },
  low:    { bg: '#f0fdf4', color: '#166534', label: 'Thấp' },
}
const statusDot = {
  done:        '#22c55e',
  in_progress: '#f59e0b',
  todo:        '#6b7280',
}

function isOverdue(due) {
  if (!due) return false
  const t = new Date(); t.setHours(0,0,0,0)
  return new Date(due) < t
}
function formatDate(due) {
  if (!due) return null
  return new Date(due).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}
function applyFilters(cards, filters) {
  return cards.filter(card => {
    if (filters.search && !card.title.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.priorities?.length > 0 && !filters.priorities.includes(card.priority)) return false
    if (filters.tags?.length > 0 && !filters.tags.includes(card.tag)) return false
    if (filters.deadlines?.length > 0) {
      const now = new Date(); now.setHours(0,0,0,0)
      const match = filters.deadlines.some(d => {
        if (d === 'overdue') return isOverdue(card.dueDate)
        if (d === 'today')   return card.dueDate && new Date(card.dueDate).toDateString() === new Date().toDateString()
        if (d === 'week')    { const w = new Date(now); w.setDate(now.getDate()+7); return card.dueDate && new Date(card.dueDate) >= now && new Date(card.dueDate) <= w }
        if (d === 'none')    return !card.dueDate
        return false
      })
      if (!match) return false
    }
    return true
  })
}

function CardItem({ card, listId, onDragStart, onDragEnd, onClick }) {
  const pb = priorityBadge[card.priority] || priorityBadge.low
  const dot = statusDot[card.status] || '#6b7280'
  return (
    <div className="card" draggable
      onDragStart={() => onDragStart(card._id || card.id, listId)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(card, listId)}>
      <div className="card-label-bar" style={{ background: labelColor(card.labelColor || card.label) }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: dot, marginTop: 4, flexShrink: 0 }} title={'Trạng thái: ' + (card.status || 'todo')} />
        <div className="card-title" style={{ margin: 0 }}>{card.title}</div>
      </div>
      <div className="card-meta">
        {card.tag && <span className="card-tag">{card.tag}</span>}
        {card.priority && (
          <span className="card-priority" style={{ background: pb.bg, color: pb.color }}>{pb.label}</span>
        )}
        {card.checklist?.length > 0 && (
          <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>
            ☑️ {card.checklist.filter(c => c.completed).length}/{card.checklist.length}
          </span>
        )}
        {card.dueDate && (
          <span className={'card-due' + (isOverdue(card.dueDate) ? ' overdue' : '')}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            {formatDate(card.dueDate)}
          </span>
        )}
        {card.members?.length > 0 && (
          <div className="card-avatars">
            {card.members.slice(0, 3).map((m, i) => (
              <div key={i} className="card-avatar"
                style={{ background: 'linear-gradient(135deg,#2563eb,#60a5fa)' }}>
                {(m.name || m)[0]?.toUpperCase()}
              </div>
            ))}
            {card.members.length > 3 && (
              <div className="card-avatar" style={{ background: '#6b7280', fontSize: 9 }}>
                +{card.members.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ListColumn({ list, filteredCards, onDragStart, onDragEnd, onDragOver, onCardClick, onAddCard, onEditList, onDeleteList, isFiltering, canEdit }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const doneCount = filteredCards.filter(c => c.status === 'done').length

  return (
    <div className="list" onDragOver={e => { e.preventDefault(); onDragOver(list._id) }}>
      <div className="list-header">
        <span className="list-title">{list.title}</span>
        <span className="list-badge">
          {isFiltering ? filteredCards.length + '/' + (list.cards?.length || 0) : (list.cards?.length || 0)}
          {doneCount > 0 && <span style={{ color: '#22c55e', marginLeft: 4 }}>✓{doneCount}</span>}
        </span>
        {canEdit && (
          <div style={{ position: 'relative', marginLeft: 'auto' }}>
            <button className="list-menu-btn" onClick={() => setMenuOpen(o => !o)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
              </svg>
            </button>
            {menuOpen && (
              <div className="dropdown" onMouseLeave={() => setMenuOpen(false)}>
                <button className="dropdown-item" onClick={() => { onEditList(list); setMenuOpen(false) }}>Đổi tên</button>
                <button className="dropdown-item danger" onClick={() => { onDeleteList(list._id); setMenuOpen(false) }}>Xoá cột</button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="list-cards">
        {filteredCards.map(card => (
          <CardItem key={card._id || card.id} card={card} listId={list._id}
            onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onCardClick} />
        ))}
        {isFiltering && filteredCards.length === 0 && (
          <div className="filter-empty-list">Không có thẻ nào khớp</div>
        )}
      </div>
      {canEdit && (
        <button className="list-add-btn" onClick={() => onAddCard(list._id)}>
          <span className="add-icon">+</span>Thêm thẻ
        </button>
      )}
    </div>
  )
}

export default function BoardView({ projectId, projectName, onBackToProjects }) {
  const { user }                        = useAuth()
  const [lists, setLists]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [boardId, setBoardId]           = useState(null)
  const [modal, setModal]               = useState(null)
  const [showFilter, setShowFilter]     = useState(false)
  const [filters, setFilters]           = useState({ priorities: [], deadlines: [], tags: [], search: '' })
  const [projectMembers, setProjectMembers] = useState([])
  const [myProjectRole, setMyProjectRole]   = useState('member')
  const drag = useRef({ cardId: null, fromList: null, toList: null })

  // Kiểm tra quyền
  const isAdmin  = user?.role === 'admin'
  const canEdit  = isAdmin || myProjectRole === 'pm'
  const canAddCard = isAdmin || myProjectRole === 'pm' || myProjectRole === 'member'

  useEffect(() => {
    if (!projectId) return
    let cancelled = false
    const init = async () => {
      try {
        setLoading(true)

        // Lấy thông tin project để biết role
        const projRes = await getProjectAPI(projectId)
        const project = projRes.data?.data || projRes.data
        if (!cancelled && project) {
          const members = project.members || []
          // Lấy danh sách user từ members để dùng cho @mention
          const memberUsers = members.map(m => m.user).filter(Boolean)
          setProjectMembers(memberUsers)

          // Xác định role của mình trong project
          if (isAdmin) {
            setMyProjectRole('admin')
          } else {
            const myMember = members.find(m => (m.user?._id || m.user) === user._id)
            setMyProjectRole(myMember?.role || 'member')
          }
        }

        // Load board
        const boardRes = await getBoardsAPI(projectId)
        const boards   = boardRes.data?.data || boardRes.data || []
        let board      = boards[0]
        if (!board) {
          const newRes = await createBoardAPI({ project: projectId, title: 'Board chính' })
          board = newRes.data?.data || newRes.data
        }
        if (cancelled) return
        setBoardId(board._id)

        const listsData = await getListsAPI(board._id)
        if (cancelled) return
        const listsWithCards = await Promise.all(
          listsData.map(async list => {
            try { return { ...list, cards: await getCardsAPI(list._id) } }
            catch { return { ...list, cards: [] } }
          })
        )
        if (!cancelled) setLists(listsWithCards)
      } catch (err) { console.error('Lỗi khởi tạo board:', err) }
      finally { if (!cancelled) setLoading(false) }
    }
    init()
    return () => { cancelled = true }
  }, [projectId])

  const allTags = useMemo(() => {
    const tags = new Set()
    lists.forEach(l => l.cards?.forEach(c => { if (c.tag) tags.add(c.tag) }))
    return [...tags]
  }, [lists])

  const isFiltering = filters.search || filters.priorities?.length > 0 || filters.deadlines?.length > 0 || filters.tags?.length > 0
  const filterCount = (filters.priorities?.length || 0) + (filters.deadlines?.length || 0) + (filters.tags?.length || 0) + (filters.search ? 1 : 0)

  const handleDragStart = (cardId, listId) => { drag.current = { cardId, fromList: listId, toList: listId } }
  const handleDragEnd   = async () => {
    const { cardId, fromList, toList } = drag.current
    if (!cardId || fromList === toList) return
    try {
      await moveCardAPI(cardId, toList)
      setLists(prev => {
        const card = prev.find(l => l._id === fromList)?.cards?.find(c => (c._id||c.id) === cardId)
        if (!card) return prev
        return prev.map(l => {
          if (l._id === fromList) return { ...l, cards: l.cards.filter(c => (c._id||c.id) !== cardId) }
          if (l._id === toList)   return { ...l, cards: [...l.cards, card] }
          return l
        })
      })
    } catch { alert('Lỗi di chuyển thẻ') }
    drag.current = { cardId: null, fromList: null, toList: null }
  }
  const handleDragOver = listId => { drag.current.toList = listId }

  const handleSaveCard = async (card, targetListId) => {
    try {
      if (card._id) {
        const res     = await updateCardAPI(card._id, { ...card, list: targetListId })
        const updated = res.data?.data || res.data
        setLists(prev => {
          let r = prev.map(l => ({ ...l, cards: l.cards.filter(c => c._id !== card._id) }))
          return r.map(l => l._id === targetListId ? { ...l, cards: [...l.cards, updated] } : l)
        })
      } else {
        const res     = await createCardAPI(targetListId, card)
        const newCard = res.data?.data || res.data
        setLists(prev => prev.map(l => l._id === targetListId ? { ...l, cards: [...l.cards, newCard] } : l))
      }
    } catch { alert('Lỗi lưu thẻ') }
  }

  const handleDeleteCard = async (cardId, listId) => {
    try {
      await deleteCardAPI(cardId)
      setLists(prev => prev.map(l =>
        l._id === listId ? { ...l, cards: l.cards.filter(c => (c._id||c.id) !== cardId) } : l
      ))
    } catch { alert('Lỗi xoá thẻ') }
  }

  const handleAddList = async () => {
    if (!canEdit) return
    const title = window.prompt('Tên cột mới:')
    if (!title?.trim() || !boardId) return
    try {
      const res     = await createListAPI(boardId, title.trim())
      const newList = res.data?.data || res.data
      setLists(prev => [...prev, { ...newList, cards: [] }])
    } catch { alert('Lỗi tạo cột') }
  }

  const handleEditList = async (list) => {
    const title = window.prompt('Tên cột:', list.title)
    if (!title?.trim()) return
    try {
      await updateListAPI(list._id, title.trim())
      setLists(prev => prev.map(l => l._id === list._id ? { ...l, title: title.trim() } : l))
    } catch { alert('Lỗi đổi tên cột') }
  }

  const handleDeleteList = async (listId) => {
    if (!window.confirm('Xoá cột này và tất cả thẻ bên trong?')) return
    try {
      await deleteListAPI(listId)
      setLists(prev => prev.filter(l => l._id !== listId))
    } catch { alert('Lỗi xoá cột') }
  }

  if (loading) return <div className="board-loading">Đang tải board...</div>

  return (
    <>
      <div className="subheader">
        <button className="btn-back" onClick={onBackToProjects}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Dự án
        </button>
        <span className="board-title">{projectName || 'Board'}</span>

        {/* Role badge */}
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20,
          background: canEdit ? '#f59e0b22' : '#3b82f622',
          color: canEdit ? '#f59e0b' : '#3b82f6',
          border: '1px solid ' + (canEdit ? '#f59e0b44' : '#3b82f644') }}>
          {isAdmin ? 'Admin' : myProjectRole === 'pm' ? 'PM' : 'Thành viên'}
        </span>

        <div className="subheader-actions">
          <button className={'sh-btn' + (showFilter ? ' sh-btn-active' : '')}
            onClick={() => setShowFilter(o => !o)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            Bộ lọc {filterCount > 0 && <span className="filter-badge">{filterCount}</span>}
          </button>
        </div>
      </div>

      <div className="board-layout">
        {showFilter && (
          <FilterPanel filters={filters} onChange={setFilters}
            onClose={() => setShowFilter(false)} allTags={allTags} />
        )}
        <div className="board-canvas">
          {lists.map(list => {
            const filteredCards = isFiltering ? applyFilters(list.cards || [], filters) : (list.cards || [])
            return (
              <ListColumn key={list._id} list={list} filteredCards={filteredCards}
                isFiltering={!!isFiltering}
                onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragOver={handleDragOver}
                onCardClick={(card, listId) => setModal({ card, listId })}
                onAddCard={listId => { if (canAddCard) setModal({ card: null, listId }) }}
                onEditList={handleEditList} onDeleteList={handleDeleteList}
                canEdit={canEdit} />
            )
          })}
          {canEdit && (
            <button className="add-list-btn" onClick={handleAddList}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Thêm danh sách
            </button>
          )}
        </div>
      </div>

      {modal && (
        <CardModal
          card={modal.card}
          listId={modal.listId}
          lists={lists}
          onSave={handleSaveCard}
          onDelete={handleDeleteCard}
          onClose={() => setModal(null)}
          projectMembers={projectMembers}
          canEdit={canEdit || !modal.card}
          projectId={projectId}
        />
      )}
    </>
  )
}
