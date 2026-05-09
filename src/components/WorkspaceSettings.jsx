import { useState, useEffect } from 'react'
import api from '../services/api'

export default function WorkspaceSettings({ onClose }) {
  const [settings, setSettings] = useState(null)
  const [tab, setTab]           = useState('general')
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')

  useEffect(() => {
    api.get('/workspace').then(r => {
      setSettings(r.data?.data || null)
    }).finally(() => setLoading(false))
  }, [])

  const save = async (endpoint, body) => {
    setSaving(true); setMsg('')
    try {
      const r = await api.put('/workspace' + endpoint, body)
      setSettings(r.data?.data)
      setMsg('Da luu!')
      setTimeout(() => setMsg(''), 2000)
    } catch (e) { setMsg('Loi: ' + (e.response?.data?.message || e.message)) }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 540 }}>
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Dang tai...</div>
      </div>
    </div>
  )

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h2 className="modal-title">Cau hinh Workspace</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px' }}>
          {[['general','Chung'],['password-policy','Chinh sach MK'],['features','Tinh nang']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding: '8px 14px', fontSize: 13, border: 'none', background: 'none', cursor: 'pointer',
                color: tab === id ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -1, fontWeight: tab === id ? 600 : 400 }}>
              {label}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {msg && (
            <div style={{ padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 13,
              background: msg.startsWith('Loi') ? 'rgba(239,68,68,.15)' : 'rgba(34,197,94,.15)',
              color: msg.startsWith('Loi') ? '#ef4444' : '#22c55e',
              border: '1px solid ' + (msg.startsWith('Loi') ? 'rgba(239,68,68,.3)' : 'rgba(34,197,94,.3)') }}>
              {msg}
            </div>
          )}

          {/* General */}
          {tab === 'general' && settings && (
            <GeneralTab settings={settings} onSave={body => save('', body)} saving={saving} />
          )}

          {/* Password Policy */}
          {tab === 'password-policy' && settings && (
            <PasswordPolicyTab policy={settings.passwordPolicy}
              onSave={body => save('/password-policy', body)} saving={saving} />
          )}

          {/* Features */}
          {tab === 'features' && settings && (
            <FeaturesTab features={settings.features}
              onSave={body => save('/features', { features: body })} saving={saving} />
          )}
        </div>
      </div>
    </div>
  )
}

function GeneralTab({ settings, onSave, saving }) {
  const [form, setForm] = useState({
    name:     settings.name     || '',
    logoUrl:  settings.logoUrl  || '',
    timezone: settings.timezone || 'Asia/Ho_Chi_Minh',
    language: settings.language || 'vi',
  })
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }}>
      <div className="modal-field">
        <label className="modal-label">Ten Workspace</label>
        <input className="modal-input" value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="PMS Workspace" />
      </div>
      <div className="modal-field">
        <label className="modal-label">URL Logo</label>
        <input className="modal-input" value={form.logoUrl}
          onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))} placeholder="https://..." />
      </div>
      <div className="modal-row">
        <div className="modal-field" style={{ flex: 1 }}>
          <label className="modal-label">Mui gio</label>
          <select className="modal-input" value={form.timezone}
            onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}>
            <option value="Asia/Ho_Chi_Minh">Ha Noi / TP.HCM (UTC+7)</option>
            <option value="Asia/Bangkok">Bangkok (UTC+7)</option>
            <option value="Asia/Singapore">Singapore (UTC+8)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
        <div className="modal-field" style={{ flex: 1 }}>
          <label className="modal-label">Ngon ngu</label>
          <select className="modal-input" value={form.language}
            onChange={e => setForm(f => ({ ...f, language: e.target.value }))}>
            <option value="vi">Tieng Viet</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
      <div className="modal-footer" style={{ paddingTop: 8 }}>
        <div style={{ marginLeft: 'auto' }}>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Dang luu...' : 'Luu'}</button>
        </div>
      </div>
    </form>
  )
}

function PasswordPolicyTab({ policy, onSave, saving }) {
  const [form, setForm] = useState({
    minLength:        policy?.minLength        || 6,
    requireUppercase: policy?.requireUppercase || false,
    requireNumber:    policy?.requireNumber    || false,
    sessionTimeout:   policy?.sessionTimeout   || 480,
  })
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }}>
      <div className="modal-field">
        <label className="modal-label">Do dai mat khau toi thieu</label>
        <input className="modal-input" type="number" min="6" max="32" value={form.minLength}
          onChange={e => setForm(f => ({ ...f, minLength: parseInt(e.target.value) }))} />
      </div>
      <div className="modal-field">
        <label className="modal-label">Session timeout (phut)</label>
        <input className="modal-input" type="number" min="30" value={form.sessionTimeout}
          onChange={e => setForm(f => ({ ...f, sessionTimeout: parseInt(e.target.value) }))} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {[['requireUppercase','Yeu cau chu hoa'],['requireNumber','Yeu cau chu so']].map(([key, label]) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" checked={form[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
              style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
            <span style={{ color: 'var(--text)' }}>{label}</span>
          </label>
        ))}
      </div>
      <div className="modal-footer" style={{ paddingTop: 8 }}>
        <div style={{ marginLeft: 'auto' }}>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Dang luu...' : 'Luu'}</button>
        </div>
      </div>
    </form>
  )
}

function FeaturesTab({ features, onSave, saving }) {
  const [form, setForm] = useState({ ...features })
  const featureList = [
    ['chat',    'Chat nhom (UC25)'],
    ['finance', 'Quan ly ngan sach (UC26-30)'],
    ['sprint',  'Sprint / Burndown (UC15-16)'],
    ['report',  'Bao cao & Thong ke (UC31-34)'],
  ]
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        {featureList.map(([key, label]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                {form[key] ? 'Dang bat' : 'Dang tat'}
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-flex', cursor: 'pointer' }}>
              <input type="checkbox" checked={form[key] || false}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                style={{ opacity: 0, width: 0, height: 0 }} />
              <div style={{ width: 44, height: 24, borderRadius: 999, background: form[key] ? 'var(--accent)' : 'var(--border)',
                position: 'relative', transition: 'background .2s' }}>
                <div style={{ position: 'absolute', top: 3, left: form[key] ? 22 : 3, width: 18, height: 18,
                  borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
              </div>
            </label>
          </div>
        ))}
      </div>
      <div className="modal-footer" style={{ paddingTop: 8 }}>
        <div style={{ marginLeft: 'auto' }}>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Dang luu...' : 'Luu'}</button>
        </div>
      </div>
    </form>
  )
}
