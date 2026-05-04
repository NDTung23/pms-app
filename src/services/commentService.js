import api from './api'

export const getCommentsAPI    = async (cardId) => api.get(`/comments/${cardId}`)
export const createCommentAPI  = async (cardId, content) => api.post(`/comments/${cardId}`, { content })
export const deleteCommentAPI  = async (id) => api.delete(`/comments/${id}`)
