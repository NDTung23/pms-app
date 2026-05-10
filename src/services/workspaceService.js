import api from './api'

export const getWorkspaceAPI         = () => api.get('/workspace')
export const updateWorkspaceAPI      = (data) => api.put('/workspace', data)
export const updatePasswordPolicyAPI = (data) => api.put('/workspace/password-policy', data)
export const updateFeaturesAPI       = (features) => api.put('/workspace/features', { features })
