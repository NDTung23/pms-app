import api from './api'

export const getNotificationsAPI    = async () => api.get('/notifications')
export const markReadAPI            = async (id) => api.patch(`/notifications/${id}/read`)
export const markAllReadAPI         = async () => api.patch('/notifications/read-all')
export const deleteNotificationAPI  = async (id) => api.delete(`/notifications/${id}`)
