import api from './api'

export const getBudgetAPI            = (projectId) => api.get('/finance/budget?projectId=' + projectId)
export const upsertBudgetAPI         = (data) => api.post('/finance/budget', data)
export const getTransactionsAPI      = (projectId) => api.get('/finance/transactions?projectId=' + projectId)
export const createTransactionAPI    = (data) => api.post('/finance/transactions', data)
export const approveTransactionAPI   = (id, status) => api.patch('/finance/transactions/' + id + '/approve', { status })
export const deleteTransactionAPI    = (id) => api.delete('/finance/transactions/' + id)
export const getFinancialOverviewAPI = (projectId) => api.get('/finance/overview?projectId=' + projectId)

// UC30: Xuất báo cáo tài chính CSV
export const exportFinanceCSV = async (projectId) => {
  const res = await api.get('/finance/export/csv?projectId=' + projectId, {
    responseType: 'blob',
  })
  // Tạo link tải file
  const url  = URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a')
  link.href     = url
  link.download = 'tai-chinh-' + new Date().toISOString().slice(0,10) + '.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
