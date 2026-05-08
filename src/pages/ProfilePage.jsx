import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'

export default function ProfilePage({ onClose }) {
  const { user, setUser } = useAuth()
  const [tab, setTab]     = useState('profile') // 'profile' | 'password'
  const [form, setForm]   = useState({
    name: user?.name || '', avatarUrl: user?.avatarUrl || '',
    phone: user?.phone || '', timezone: user?.timezone || 'Asia/Ho_Chi_Minh', language: user?.language || 'vi',
  })
  const [pwd, setPwd]     = useState({ old: '', newPwd: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState('')
  const [err, setErr]         = useState('')

  const set  = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setPw = (k, v) => setPwd(p => ({ ...p, [k]: v }))

  const handleProfile = async (e) => {
    e.preventDefault()
    setErr(''); setMsg('')
    setLoading(true)
    try {
      const res = await api.put('/auth/profile', form)
      setUser(res.data?.data || res.data)
      setMsg('Cập nhật thành công!')
    } catch (e) { setErr(e.response?.data?.message || 'Lỗi cập nhật') }
    finally { setLoading(false) }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    setErr(''); setMsg('')
    if (pwd.newPwd.length < 6) return setErr('Mật khẩu mới phải có ít nhất 6 ký tự')
    if (pwd.newPwd !== pwd.confirm) return setErr('Mật khẩu xác nhận không khớp')
    setLoading(true)
    try {
      await api.put('/auth/change-password', { oldPassword: pwd.old, newPassword: pwd.newPwd })
      setMsg('Đổi mật khẩu thành công!')
      setPwd({ old: '', newPwd: '', confirm: '' })
    } catch (e) { setErr(e.response?.data?.message || 'Lỗi đổi mật khẩu') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h2 className="modal-title">Hồ sơ cá nhân</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px' }}>
          {[['profile','Thông tin'],['password','Mật khẩu']].map(([id, label]) => (
            <button key={id} onClick={() => { setTab(id); setMsg(''); setErr('') }}
              style={{ padding: '10px 16px', fontSize: 13, border: 'none', background: 'none', cursor: 'pointer',
                color: tab === id ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -1, fontWeight: tab === id ? 600 : 400 }}>
              {label}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {msg && <div style={{ background: 'rgba(34,197,94,.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,.3)', borderRadius: 8, padding: '8px 12px', fontSize: 13, marginBottom: 12 }}>{msg}</div>}
          {err && <div className="auth-error" style={{ marginBottom: 12 }}>{err}</div>}

          {tab === 'profile' && (
            <form onSubmit={handleProfile}>
              {/* Avatar preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                  {form.avatarUrl
                    ? <img src={form.avatarUrl} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="avatar" />
                    : (user?.name || 'U')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="modal-label" style={{ marginBottom: 4 }}>URL Avatar</div>
                  <input className="modal-input" value={form.avatarUrl}
                    onChange={e => set('avatarUrl', e.target.value)}
                    placeholder="https://example.com/avatar.jpg" />
                </div>
              </div>

              <div className="modal-field">
                <label className="modal-label">Họ và tên *</label>
                <input className="modal-input" value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>
              <div className="modal-field">
                <label className="modal-label">Số điện thoại</label>
                <input className="modal-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0901234567" />
              </div>
              <div className="modal-row">
                <div className="modal-field" style={{ flex: 1 }}>
                  <label className="modal-label">Múi giờ</label>
                  <select className="modal-input" value={form.timezone} onChange={e => set('timezone', e.target.value)}>
                    <option value="Asia/Ho_Chi_Minh">Hà Nội / TP.HCM (UTC+7)</option>
                    <option value="Asia/Bangkok">Bangkok (UTC+7)</option>
                    <option value="Asia/Singapore">Singapore (UTC+8)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div className="modal-field" style={{ flex: 1 }}>
                  <label className="modal-label">Ngôn ngữ</label>
                  <select className="modal-input" value={form.language} onChange={e => set('language', e.target.value)}>
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer" style={{ paddingTop: 8 }}>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <button type="button" className="btn-ghost" onClick={onClose}>Đóng</button>
                  <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
                </div>
              </div>
            </form>
          )}

          {tab === 'password' && (
            <form onSubmit={handlePassword}>
              <div className="modal-field">
                <label className="modal-label">Mật khẩu hiện tại</label>
                <input className="modal-input" type="password" value={pwd.old} onChange={e => setPw('old', e.target.value)} required />
              </div>
              <div className="modal-field">
                <label className="modal-label">Mật khẩu mới</label>
                <input className="modal-input" type="password" placeholder="Tối thiểu 6 ký tự" value={pwd.newPwd} onChange={e => setPw('newPwd', e.target.value)} required />
              </div>
              <div className="modal-field">
                <label className="modal-label">Xác nhận mật khẩu mới</label>
                <input className="modal-input" type="password" value={pwd.confirm} onChange={e => setPw('confirm', e.target.value)} required />
              </div>
              <div className="modal-footer" style={{ paddingTop: 8 }}>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <button type="button" className="btn-ghost" onClick={onClose}>Đóng</button>
                  <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Đang đổi...' : 'Đổi mật khẩu'}</button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
