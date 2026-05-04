import api from './api'

// UC11: Lấy danh sách dự án
export const getProjectsAPI = async () => {
  const { data } = await api.get('/projects')
  return data
}

// UC11: Xem chi tiết dự án
export const getProjectAPI = async (id) => {
  const { data } = await api.get(`/projects/${id}`)
  return data
}

// UC11: Tạo dự án
export const createProjectAPI = async (projectData) => {
  const { data } = await api.post('/projects', projectData)
  return data
}

// UC11: Chỉnh sửa dự án
export const updateProjectAPI = async (id, projectData) => {
  const { data } = await api.put(`/projects/${id}`, projectData)
  return data
}

// UC11: Xoá dự án
export const deleteProjectAPI = async (id) => {
  const { data } = await api.delete(`/projects/${id}`)
  return data
}

// UC13: Thêm thành viên vào dự án
export const addMemberAPI = async (projectId, userId, role) => {
  const { data } = await api.post(`/projects/${projectId}/members`, { userId, role })
  return data
}

// UC13: Xoá thành viên khỏi dự án
export const removeMemberAPI = async (projectId, userId) => {
  const { data } = await api.delete(`/projects/${projectId}/members/${userId}`)
  return data
}

// UC14: Theo dõi tiến độ
export const getProgressAPI = async (projectId) => {
  const { data } = await api.get(`/projects/${projectId}/progress`)
  return data
}

// UC15: Sprint
export const getSprintsAPI = async (projectId) => {
  const { data } = await api.get(`/sprints?projectId=${projectId}`)
  return data
}

export const createSprintAPI = async (sprintData) => {
  const { data } = await api.post('/sprints', sprintData)
  return data
}

export const updateSprintAPI = async (id, sprintData) => {
  const { data } = await api.put(`/sprints/${id}`, sprintData)
  return data
}

export const closeSprintAPI = async (id) => {
  const { data } = await api.patch(`/sprints/${id}/close`)
  return data
}

// UC16: Burndown & velocity
export const getBurndownAPI = async (sprintId) => {
  const { data } = await api.get(`/reports/burndown/${sprintId}`)
  return data
}

export const getVelocityAPI = async (projectId) => {
  const { data } = await api.get(`/reports/velocity/${projectId}`)
  return data
}
