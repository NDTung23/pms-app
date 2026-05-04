import api from './api'

// ── Board ──
export const getBoardsAPI = async (projectId) => {
  const res = await api.get(`/boards?projectId=${projectId}`)
  return res
}

export const createBoardAPI = async (boardData) => {
  const res = await api.post('/boards', boardData)
  return res
}

export const deleteBoardAPI = async (id) => {
  const res = await api.delete(`/boards/${id}`)
  return res
}

// ── List (cột) ──
export const getListsAPI = async (boardId) => {
  const res = await api.get(`/lists?boardId=${boardId}`)
  return res.data?.data || res.data || []
}

export const createListAPI = async (boardId, title) => {
  const res = await api.post('/lists', { board: boardId, title })
  return res
}

export const updateListAPI = async (id, title) => {
  const res = await api.put(`/lists/${id}`, { title })
  return res
}

export const deleteListAPI = async (id) => {
  const res = await api.delete(`/lists/${id}`)
  return res
}

// ── Card (task) ──
export const getCardsAPI = async (listId) => {
  const res = await api.get(`/cards?listId=${listId}`)
  return res.data?.data || res.data || []
}

export const createCardAPI = async (listId, cardData) => {
  const res = await api.post('/cards', { list: listId, ...cardData })
  return res
}

export const updateCardAPI = async (id, cardData) => {
  const res = await api.put(`/cards/${id}`, cardData)
  return res
}

export const deleteCardAPI = async (id) => {
  const res = await api.delete(`/cards/${id}`)
  return res
}

// UC19: Kéo thả
export const moveCardAPI = async (id, toListId) => {
  const res = await api.patch(`/cards/${id}/move`, { toListId })
  return res
}

// UC20: Gán thành viên
export const assignMemberAPI = async (cardId, userId) => {
  const res = await api.post(`/cards/${cardId}/members`, { userId })
  return res
}

export const removeMemberFromCardAPI = async (cardId, userId) => {
  const res = await api.delete(`/cards/${cardId}/members/${userId}`)
  return res
}
