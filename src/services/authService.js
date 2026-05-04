import api from './api'

// UC1: Đăng ký
export const registerAPI = async (name, email, password) => {
  const res = await api.post('/auth/register', { name, email, password })
  return res.data.data  // trả về { token, user }
}

// UC2: Đăng nhập
export const loginAPI = async (email, password) => {
  const res = await api.post('/auth/login', { email, password })
  return res.data.data  // trả về { token, user }
}

// UC3: Đăng xuất
export const logoutAPI = async () => {
  const res = await api.post('/auth/logout')
  return res.data
}

// UC4: Quên mật khẩu
export const forgotPasswordAPI = async (email) => {
  const res = await api.post('/auth/forgot-password', { email })
  return res.data
}

// UC4: Đặt lại mật khẩu
export const resetPasswordAPI = async (token, password) => {
  const res = await api.post('/auth/reset-password', { token, password })
  return res.data
}

// UC5: Đổi mật khẩu
export const changePasswordAPI = async (oldPassword, newPassword) => {
  const res = await api.put('/auth/change-password', { oldPassword, newPassword })
  return res.data
}

// Lấy thông tin user hiện tại
export const getMeAPI = async () => {
  const res = await api.get('/auth/me')
  return res.data.data  // trả về { _id, name, email, role }
}
