import api from './api'

export const getChannelsAPI   = (projectId) => api.get(`/chat/channels?projectId=${projectId}`)
export const createChannelAPI = (data) => api.post('/chat/channels', data)
export const deleteChannelAPI = (id) => api.delete(`/chat/channels/${id}`)
export const getMessagesAPI   = (channelId) => api.get(`/chat/channels/${channelId}/messages`)
export const sendMessageAPI   = (channelId, data) => api.post(`/chat/channels/${channelId}/messages`, data)
export const deleteMessageAPI = (id) => api.delete(`/chat/messages/${id}`)
