import axios from 'axios'

// Khi deploy: dùng VITE_API_URL từ biến môi trường
// Khi dev local: dùng proxy /api → localhost:5000
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('pms_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pms_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
