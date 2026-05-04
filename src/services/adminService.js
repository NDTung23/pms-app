import api from './api'

export const getUsersAPI        = async () => api.get('/users')
export const changeRoleAPI      = async (id, role) => api.patch(`/users/${id}/role`, { role })
export const toggleActiveAPI    = async (id) => api.patch(`/users/${id}/toggle-active`)
export const deleteUserAPI      = async (id) => api.delete(`/users/${id}`)
