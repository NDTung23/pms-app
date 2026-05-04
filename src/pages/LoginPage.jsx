import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { login, error } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return
    setLoading(true)
    const res = await login(form.email, form.password)
    setLoading(false)
    if (res.success) navigate('/')
  }

  return (
    <div className="auth-page">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-icon"><span/><span/><span/><span/></div>
          <span>PMS</span>
        </div>

        <h1 className="auth-title">Đăng nhập</h1>
        <p className="auth-sub">Chào mừng trở lại! Nhập thông tin để tiếp tục.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Mật khẩu</label>
            <input
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              required
            />
          </div>

          <div className="auth-forgot">
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="auth-switch">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  )
}
