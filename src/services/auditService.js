import api from './api'

export const getAuditLogsAPI = (params = {}) => {
  const q = new URLSearchParams(params).toString()
  return api.get(`/audit-logs?${q}`)
}
