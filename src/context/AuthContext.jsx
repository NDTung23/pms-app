import { createContext, useState, useEffect } from 'react'
import { loginAPI, registerAPI, logoutAPI, getMeAPI } from '../services/authService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  // Kiểm tra token còn hợp lệ khi load lại trang
  useEffect(() => {
    const token = localStorage.getItem('pms_token')
    if (!token) { setLoading(false); return }

    getMeAPI()
      .then(userData => setUser(userData))
      .catch(() => localStorage.removeItem('pms_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    setError(null)
    try {
      const { token, user } = await loginAPI(email, password)
      localStorage.setItem('pms_token', token)
      setUser(user)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng nhập thất bại'
      setError(msg)
      return { success: false, message: msg }
    }
  }

  const register = async (name, email, password) => {
    setError(null)
    try {
      const { token, user } = await registerAPI(name, email, password)
      localStorage.setItem('pms_token', token)
      setUser(user)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng ký thất bại'
      setError(msg)
      return { success: false, message: msg }
    }
  }

  const logout = async () => {
    try { await logoutAPI() } catch (err) {
      console.error('Logout error:', err)
    }
    localStorage.removeItem('pms_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
