import { useState, useEffect } from 'react'

const PRESETS = [
  { id: 'midnight', label: 'Đêm tối',    colors: ['#0a0e1a', '#0d1535'] },
  { id: 'ocean',    label: 'Đại dương',  colors: ['#0c1445', '#0e3460'] },
  { id: 'forest',   label: 'Rừng xanh',  colors: ['#0a1a0e', '#0d2f1a'] },
  { id: 'sunset',   label: 'Hoàng hôn',  colors: ['#1a0a0e', '#2d0f1a'] },
  { id: 'aurora',   label: 'Cực quang',  colors: ['#050d1a', '#0a1f2d'] },
  { id: 'coffee',   label: 'Cà phê',     colors: ['#1a120a', '#2d1f0d'] },
]

const OVERLAYS = [
  { id: '0',   label: 'Không' },
  { id: '30',  label: 'Nhẹ'   },
  { id: '55',  label: 'Vừa'   },
  { id: '75',  label: 'Đậm'   },
]

export default function BackgroundPicker({ onClose }) {
  const [activeBg,   setActiveBg]   = useState(() => localStorage.getItem('pms_bg')      || 'midnight')
  const [customImg,  setCustomImg]  = useState(() => localStorage.getItem('pms_bg_img')  || '')
  const [overlay,    setOverlay]    = useState(() => localStorage.getItem('pms_overlay')  || '55')
  const [theme,      setTheme]      = useState(() => localStorage.getItem('pms_theme')    || 'dark')

  // Apply ngay khi thay đổi
  useEffect(() => {
    const app = document.querySelector('.app')
    if (!app) return

    if (activeBg === 'custom' && customImg) {
      app.setAttribute('data-bg', 'custom')
      app.style.setProperty('--bg-image', `url("${customImg}")`)
      app.style.setProperty('--bg-overlay', `rgba(0,0,0,.${overlay})`)
    } else {
      app.setAttribute('data-bg', activeBg)
      app.style.removeProperty('--bg-image')
    }

    app.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)

    localStorage.setItem('pms_bg',      activeBg)
    localStorage.setItem('pms_bg_img',  customImg)
    localStorage.setItem('pms_overlay', overlay)
    localStorage.setItem('pms_theme',   theme)
  }, [activeBg, customImg, overlay, theme])

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Ảnh tối đa 5MB!')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setCustomImg(ev.target.result)
      setActiveBg('custom')
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <h2 className="modal-title">🎨 Tuỳ chỉnh giao diện</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Chế độ sáng/tối */}
          <div>
            <div className="modal-label">Chế độ màu</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['dark','🌙 Tối'],['light','☀️ Sáng']].map(([id, label]) => (
                <button key={id} onClick={() => setTheme(id)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer',
                    fontSize: 13, fontWeight: theme === id ? 700 : 500,
                    background: theme === id ? 'linear-gradient(135deg,var(--accent),#7c3aed)' : 'var(--glass-bg)',
                    border: theme === id ? 'none' : '1px solid var(--border)',
                    color: theme === id ? '#fff' : 'var(--text-muted)',
                    boxShadow: theme === id ? '0 4px 16px rgba(59,130,246,.35)' : 'none',
                    transition: 'all .2s',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Preset nền */}
          <div>
            <div className="modal-label">Nền có sẵn</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {PRESETS.map(p => (
                <button key={p.id} onClick={() => setActiveBg(p.id)}
                  style={{
                    padding: 0, borderRadius: 10, overflow: 'hidden',
                    border: activeBg === p.id ? '2px solid var(--accent)' : '2px solid var(--border)',
                    cursor: 'pointer', background: 'none',
                    boxShadow: activeBg === p.id ? '0 0 0 3px rgba(59,130,246,.25)' : 'none',
                    transition: 'all .2s',
                  }}>
                  {/* Preview gradient */}
                  <div style={{
                    height: 52,
                    background: `linear-gradient(135deg, ${p.colors[0]}, ${p.colors[1]})`,
                    position: 'relative',
                  }}>
                    {activeBg === p.id && (
                      <div style={{ position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%,-50%)',
                        width: 20, height: 20, borderRadius: '50%',
                        background: 'var(--accent)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 11, color: '#fff' }}>
                        ✓
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '6px 8px', fontSize: 11.5, fontWeight: 600,
                    color: activeBg === p.id ? 'var(--accent)' : 'var(--text-muted)',
                    background: 'var(--glass-bg)', textAlign: 'center' }}>
                    {p.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Upload ảnh nền */}
          <div>
            <div className="modal-label">Ảnh nền tuỳ chỉnh</div>
            <label style={{
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
              padding: '12px 16px', borderRadius: 10,
              border: activeBg === 'custom' ? '2px solid var(--accent)' : '2px dashed var(--border)',
              background: activeBg === 'custom' ? 'rgba(59,130,246,.08)' : 'var(--glass-bg)',
              transition: 'all .2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => {
                if (activeBg !== 'custom')
                  e.currentTarget.style.borderColor = 'var(--border)'
              }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                  {customImg ? '✅ Đã chọn ảnh' : 'Chọn ảnh từ máy tính'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                  JPG, PNG, WebP — tối đa 5MB
                </div>
              </div>
              {customImg && (
                <img src={customImg} alt="preview"
                  style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8 }} />
              )}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
            </label>

            {customImg && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Độ tối overlay:</div>
                {OVERLAYS.map(o => (
                  <button key={o.id} onClick={() => setOverlay(o.id)}
                    style={{
                      padding: '4px 10px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                      background: overlay === o.id ? 'var(--accent)' : 'var(--glass-bg)',
                      border: '1px solid var(--border)',
                      color: overlay === o.id ? '#fff' : 'var(--text-muted)',
                      fontWeight: overlay === o.id ? 700 : 400,
                      transition: 'all .15s',
                    }}>
                    {o.label}
                  </button>
                ))}
                <button onClick={() => { setCustomImg(''); setActiveBg('midnight') }}
                  style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: 8,
                    fontSize: 12, cursor: 'pointer', background: 'rgba(239,68,68,.12)',
                    border: '1px solid rgba(239,68,68,.25)', color: 'var(--danger)', transition: 'all .15s' }}>
                  Xoá ảnh
                </button>
              </div>
            )}
          </div>

        </div>

        <div className="modal-footer">
          <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
            Thay đổi được lưu tự động
          </div>
          <button className="btn-primary" style={{ marginLeft: 'auto' }} onClick={onClose}>
            Xong
          </button>
        </div>
      </div>
    </div>
  )
}
