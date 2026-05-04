import { createContext, useState, useCallback, useRef } from 'react'
import {
  getListsAPI, createListAPI, updateListAPI, deleteListAPI,
  getCardsAPI, createCardAPI, updateCardAPI, deleteCardAPI, moveCardAPI,
} from '../services/boardService'

export const BoardContext = createContext(null)

export function BoardProvider({ children }) {
  const [lists, setLists]       = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const currentBoardId          = useRef(null)

  // Load lists + cards theo boardId — chỉ load lại nếu boardId thay đổi
  const loadBoard = useCallback(async (boardId) => {
    if (!boardId) return

    // Nếu cùng boardId thì không load lại
    if (currentBoardId.current === boardId && lists.length > 0) {
      console.log('Board đã load rồi, bỏ qua')
      return
    }

    currentBoardId.current = boardId
    setLoading(true)
    setError(null)

    try {
      const listsData = await getListsAPI(boardId)

      const listsWithCards = await Promise.all(
        listsData.map(async (list) => {
          try {
            const cards = await getCardsAPI(list._id)
            return { ...list, cards }
          } catch {
            return { ...list, cards: [] }
          }
        })
      )
      setLists(listsWithCards)
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tải board')
    } finally {
      setLoading(false)
    }
  }, [lists.length])

  // ── List CRUD ──
  const addList = async (boardId, title) => {
    try {
      const res = await createListAPI(boardId, title)
      const newList = res.data?.data || res.data || res
      setLists(prev => [...prev, { ...newList, cards: [] }])
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi tạo cột')
    }
  }

  const editList = async (listId, title) => {
    try {
      await updateListAPI(listId, title)
      setLists(prev => prev.map(l =>
        (l._id === listId || l.id === listId) ? { ...l, title } : l
      ))
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi cập nhật cột')
    }
  }

  const removeList = async (listId) => {
    try {
      await deleteListAPI(listId)
      setLists(prev => prev.filter(l => l._id !== listId && l.id !== listId))
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi xoá cột')
    }
  }

  // ── Card CRUD ──
  const addCard = async (listId, cardData) => {
    try {
      const res = await createCardAPI(listId, cardData)
      const newCard = res.data?.data || res.data || res
      setLists(prev => prev.map(l =>
        (l._id === listId || l.id === listId)
          ? { ...l, cards: [...(l.cards || []), newCard] }
          : l
      ))
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi tạo thẻ')
    }
  }

  const editCard = async (cardId, fromListId, cardData, toListId) => {
    try {
      const res = await updateCardAPI(cardId, { ...cardData, list: toListId })
      const updated = res.data?.data || res.data || res
      setLists(prev => {
        let result = prev.map(l => ({
          ...l,
          cards: (l.cards || []).filter(c => (c._id || c.id) !== cardId)
        }))
        return result.map(l =>
          (l._id === toListId || l.id === toListId)
            ? { ...l, cards: [...(l.cards || []), updated] }
            : l
        )
      })
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi cập nhật thẻ')
    }
  }

  const removeCard = async (cardId, listId) => {
    try {
      await deleteCardAPI(cardId)
      setLists(prev => prev.map(l =>
        (l._id === listId || l.id === listId)
          ? { ...l, cards: (l.cards || []).filter(c => (c._id || c.id) !== cardId) }
          : l
      ))
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi xoá thẻ')
    }
  }

  const moveCard = async (cardId, fromListId, toListId) => {
    try {
      await moveCardAPI(cardId, toListId)
      setLists(prev => {
        const card = prev
          .find(l => (l._id || l.id) === fromListId)
          ?.cards?.find(c => (c._id || c.id) === cardId)
        if (!card) return prev
        return prev.map(l => {
          const id = l._id || l.id
          if (id === fromListId) return { ...l, cards: (l.cards || []).filter(c => (c._id || c.id) !== cardId) }
          if (id === toListId)   return { ...l, cards: [...(l.cards || []), card] }
          return l
        })
      })
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi di chuyển thẻ')
    }
  }

  return (
    <BoardContext.Provider value={{
      lists, setLists, loading, error,
      loadBoard,
      addList, editList, removeList,
      addCard, editCard, removeCard, moveCard,
    }}>
      {children}
    </BoardContext.Provider>
  )
}
