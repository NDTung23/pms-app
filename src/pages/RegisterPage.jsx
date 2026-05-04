import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
  const { register, error } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [localErr, setLocalErr] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalErr('')

    if (form.password !== form.confirm) {
      setLocalErr('Mật khẩu xác nhận không khớp!')
      return
    }
    if (form.password.length < 6) {
      setLocalErr('Mật khẩu phải có ít nhất 6 ký tự!')
      return
    }

    setLoading(true)
    const res = await register(form.name, form.email, form.password)
    setLoading(false)
    if (res.success) navigate('/')
  }

  return (
    <div className="auth-page">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon"><span/><span/><span/><span/></div>
          <span>PMS</span>
        </div>

        <h1 className="auth-title">Tạo tài khoản</h1>
        <p className="auth-sub">Bắt đầu quản lý dự án của bạn ngay hôm nay.</p>

        {(error || localErr) && (
          <div className="auth-error">{localErr || error}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Họ và tên</label>
            <input
              className="auth-input"
              type="text"
              placeholder="Nguyễn Văn A"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
            />
          </div>

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
              placeholder="Tối thiểu 6 ký tự"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Xác nhận mật khẩu</label>
            <input
              className="auth-input"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={form.confirm}
              onChange={e => set('confirm', e.target.value)}
              required
            />
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>
        </form>

        <p className="auth-switch">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}
