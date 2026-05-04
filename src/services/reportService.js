import api from './api'

export const getDashboardAPI  = async () => api.get('/reports/overview')
export const getTaskStatsAPI  = async () => api.get('/reports/task-stats')
export const getBudgetReportAPI = async (projectId) => api.get(`/reports/budget?projectId=${projectId}`)
export const getPlannerCardsAPI = async () => api.get('/reports/planner')
