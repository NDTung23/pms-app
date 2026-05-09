import api from './api'

export const getCommentsAPI   = (cardId) => api.get('/comments/' + cardId)
export const createCommentAPI = (cardId, content, mentions) =>
  api.post('/comments/' + cardId, { content, mentions: mentions || [] })
export const deleteCommentAPI = (id) => api.delete('/comments/' + id)
