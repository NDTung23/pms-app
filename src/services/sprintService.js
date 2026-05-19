import api from './api'

export const getSprintsAPI   = (projectId) => api.get('/sprints?projectId=' + projectId)
export const createSprintAPI = (data) => api.post('/sprints', data)
export const updateSprintAPI = (id, data) => api.put('/sprints/' + id, data)

// UC15: Đóng sprint với tuỳ chọn chuyển task
export const closeSprintAPI  = (id, options = {}) =>
  api.patch('/sprints/' + id + '/close', options)

export const getBurndownAPI  = (sprintId) => api.get('/sprints/burndown/' + sprintId)
export const getVelocityAPI  = (projectId) => api.get('/sprints/velocity/' + projectId)
