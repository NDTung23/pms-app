import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../services/api'

export default function ResetPasswordPage() {
  const [params]                    = useSearchParams()
  const navigate                    = useNavigate()
  const token                       = params.get('token') || ''
  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [loading, setLoading]       = useState(false)
  const [err, setErr]               = useState('')
  const [done, setDone]             = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    if (password.length < 6) return setErr('Mật khẩu phải có ít nhất 6 ký tự')
    if (password !== confirm) return setErr('Mật khẩu xác nhận không khớp')
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      setDone(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (e) { setErr(e.response?.data?.message || 'Token không hợp lệ hoặc đã hết hạn') }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon"><span/><span/><span/><span/></div>
          <span>PMS</span>
        </div>
        <h1 className="auth-title">Đặt lại mật khẩu</h1>

        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Mật khẩu đã được cập nhật! Đang chuyển đến trang đăng nhập...
            </p>
          </div>
        ) : !token ? (
          <div className="auth-error">
            Token không hợp lệ. <Link to="/forgot-password">Thử lại</Link>
          </div>
        ) : (
          <>
            {err && <div className="auth-error">{err}</div>}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label className="auth-label">Mật khẩu mới</label>
                <input className="auth-input" type="password" placeholder="Tối thiểu 6 ký tự"
                  value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="auth-field">
                <label className="auth-label">Xác nhận mật khẩu</label>
                <input className="auth-input" type="password" placeholder="Nhập lại mật khẩu"
                  value={confirm} onChange={e => setConfirm(e.target.value)} required />
              </div>
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
