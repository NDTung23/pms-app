import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr]         = useState('')
  const [devUrl, setDevUrl]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      const res = await api.post('/auth/forgot-password', { email })
      setSent(true)
      if (res.data?.data?.resetUrl) setDevUrl(res.data.data.resetUrl)
    } catch (e) { setErr(e.response?.data?.message || 'Lỗi gửi email') }
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
        <h1 className="auth-title">Quên mật khẩu</h1>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
              Link đặt lại mật khẩu đã được gửi đến <strong>{email}</strong>.<br/>
              Link có hiệu lực trong <strong>30 phút</strong>.
            </p>
            {devUrl && (
              <div style={{ background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.3)',
                borderRadius: 8, padding: 12, fontSize: 12, marginBottom: 12, wordBreak: 'break-all' }}>
                <div style={{ color: '#60a5fa', marginBottom: 4 }}>🛠 Dev Mode — Reset URL:</div>
                <a href={devUrl} style={{ color: '#93c5fd' }}>{devUrl}</a>
              </div>
            )}
            <Link to="/login" className="auth-btn"
              style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '10px', marginTop: 8 }}>
              Quay lại đăng nhập
            </Link>
          </div>
        ) : (
          <>
            <p className="auth-sub">Nhập email để nhận link đặt lại mật khẩu.</p>
            {err && <div className="auth-error">{err}</div>}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label className="auth-label">Email</label>
                <input className="auth-input" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Đang gửi...' : 'Gửi link đặt lại'}
              </button>
            </form>
            <p className="auth-switch"><Link to="/login">← Quay lại đăng nhập</Link></p>
          </>
        )}
      </div>
    </div>
  )
}
