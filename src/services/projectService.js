import api from './api'

export const getProjectsAPI   = () => api.get('/projects')
export const getProjectAPI    = (id) => api.get('/projects/' + id)
export const createProjectAPI = (data) => api.post('/projects', data)
export const updateProjectAPI = (id, data) => api.put('/projects/' + id, data)
export const deleteProjectAPI = (id) => api.delete('/projects/' + id)
export const addMemberAPI     = (projectId, userId, role) => api.post('/projects/' + projectId + '/members', { userId, role })
export const removeMemberAPI  = (projectId, userId) => api.delete('/projects/' + projectId + '/members/' + userId)
export const getProgressAPI   = (projectId) => api.get('/projects/' + projectId + '/progress')
