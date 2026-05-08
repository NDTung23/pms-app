import api from './api'

export const getBudgetAPI            = (projectId) => api.get(`/finance/budget?projectId=${projectId}`)
export const upsertBudgetAPI         = (data) => api.post('/finance/budget', data)
export const getTransactionsAPI      = (projectId) => api.get(`/finance/transactions?projectId=${projectId}`)
export const createTransactionAPI    = (data) => api.post('/finance/transactions', data)
export const approveTransactionAPI   = (id, status) => api.patch(`/finance/transactions/${id}/approve`, { status })
export const deleteTransactionAPI    = (id) => api.delete(`/finance/transactions/${id}`)
export const getFinancialOverviewAPI = (projectId) => api.get(`/finance/overview?projectId=${projectId}`)
