import api from './api'

export const getSprintsAPI    = (projectId) => api.get(`/sprints?projectId=${projectId}`)
export const createSprintAPI  = (data) => api.post('/sprints', data)
export const updateSprintAPI  = (id, data) => api.put(`/sprints/${id}`, data)
export const closeSprintAPI   = (id) => api.patch(`/sprints/${id}/close`)
export const getBurndownAPI   = (sprintId) => api.get(`/sprints/burndown/${sprintId}`)
export const getVelocityAPI   = (projectId) => api.get(`/sprints/velocity/${projectId}`)
