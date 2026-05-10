import { useState, useEffect } from 'react'
import { getProjectsAPI, createProjectAPI, updateProjectAPI, deleteProjectAPI } from '../services/projectService'
import MemberModal from '../components/MemberModal'
import { useAuth } from '../hooks/useAuth'

const STATUS_LABELS = {
  active:    { label: 'Đang hoạt động', color: '#22c55e' },
  on_hold:   { label: 'Tạm dừng',       color: '#f59e0b' },
  completed: { label: 'Hoàn thành',     color: '#3b82f6' },
  cancelled: { label: 'Đã huỷ',         color: '#6b7280' },
}

export default function ProjectPage({ onSelectProject }) {
  const { user }                          = useAuth()
  const [projects, setProjects]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [showForm, setShowForm]           = useState(false)
  const [editProject, setEditProject]     = useState(null)
  const [memberProject, setMemberProject] = useState(null)
  const [form, setForm]                   = useState({ name: '', description: '', startDate: '', endDate: '', status: 'active' })
  const [err, setErr]                     = useState('')

  const isAdmin = user?.role === 'admin'
  const isPM    = user?.role === 'pm' || isAdmin

  useEffect(() => { loadProjects() }, [])

  const loadProjects = () => {
    setLoading(true)
    getProjectsAPI()
      .then(res => setProjects(res.data?.data || res.data || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }

  const isProjectPM = (project) => {
    if (!user) return false
    if (isAdmin) return true
    const member = project.members?.find(m => (m.user?._id || m.user) === user._id)
    return member?.role === 'pm' || project.owner?._id === user._id || project.owner === user._id
  }

  const getMyRole = (project) => {
    if (isAdmin) return 'Admin'
    const isOwner = project.owner?._id === user._id || project.owner === user._id
    if (isOwner) return 'PM (Owner)'
    const member = project.members?.find(m => (m.user?._id || m.user) === user._id)
    return member?.role === 'pm' ? 'PM' : 'Thành viên'
  }

  const openCreate = () => {
    setEditProject(null); setErr('')
    setForm({ name: '', description: '', startDate: '', endDate: '', status: 'active' })
    setShowForm(true)
  }

  const openEdit = (e, project) => {
    e.stopPropagation(); setEditProject(project); setErr('')
    setForm({
      name:        project.name,
      description: project.description || '',
      startDate:   project.startDate?.slice(0, 10) || '',
      endDate:     project.endDate?.slice(0, 10)   || '',
      status:      project.status || 'active',
    })
    setShowForm(true)
  }

  const openMembers = (e, project) => { e.stopPropagation(); setMemberProject(project) }

  const handleDelete = async (e, project) => {
    e.stopPropagation()
    if (!window.confirm(`Xoá dự án "${project.name}"? Không thể hoàn tác!`)) return
    try {
      await deleteProjectAPI(project._id)
      setProjects(prev => prev.filter(p => p._id !== project._id))
    } catch (err) { alert(err.response?.data?.message || 'Lỗi xoá dự án') }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setErr('Tên dự án không được trống'); return }
    setErr('')
    try {
      if (editProject) {
        const res     = await updateProjectAPI(editProject._id, form)
        const updated = res.data?.data || res.data
        setProjects(prev => prev.map(p => p._id === editProject._id ? updated : p))
      } else {
        const res        = await createProjectAPI(form)
        const newProject = res.data?.data || res.data
        setProjects(prev => [...prev, newProject])
      }
      setShowForm(false)
    } catch (err) { setErr(err.response?.data?.message || 'Lỗi lưu dự án') }
  }

  const handleMemberUpdate = (updated) => {
    setProjects(prev => prev.map(p => p._id === updated._id ? updated : p))
    setMemberProject(updated)
  }

  return (
    <div className="project-page">
      <div className="project-header">
        <div>
          <h1 className="project-title">Dự án của tôi</h1>
          <p style={{ fontSize: 13, color: 'var(--text-faint)', margin: '4px 0 0' }}>
            {isAdmin ? 'Tất cả dự án trong hệ thống' : 'Dự án bạn tham gia'}
          </p>
        </div>
        {isPM && (
          <button className="btn-primary" onClick={openCreate}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6 }}>
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Tạo dự án
          </button>
        )}
      </div>

      {/* Modal tạo/sửa */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editProject ? 'Chỉnh sửa dự án' : 'Tạo dự án mới'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {err && <div className="auth-error" style={{ marginBottom: 12 }}>{err}</div>}
                <div className="modal-field">
                  <label className="modal-label">Tên dự án *</label>
                  <input className="modal-input" value={form.name} autoFocus required
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Nhập tên dự án..." />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Mô tả</label>
                  <textarea className="modal-input modal-textarea" rows={3} value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Mô tả ngắn về dự án..." />
                </div>
                <div className="modal-row">
                  <div className="modal-field" style={{ flex: 1 }}>
                    <label className="modal-label">Ngày bắt đầu</label>
                    <input className="modal-input" type="date" value={form.startDate}
                      onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                  </div>
                  <div className="modal-field" style={{ flex: 1 }}>
                    <label className="modal-label">Ngày kết thúc</label>
                    <input className="modal-input" type="date" value={form.endDate}
                      onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                  </div>
                </div>
                {editProject && (
                  <div className="modal-field">
                    <label className="modal-label">Trạng thái</label>
                    <select className="modal-input" value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                      <option value="active">Đang hoạt động</option>
                      <option value="on_hold">Tạm dừng</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="cancelled">Đã huỷ</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Huỷ</button>
                  <button type="submit" className="btn-primary">{editProject ? 'Lưu thay đổi' : 'Tạo dự án'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {memberProject && (
        <MemberModal project={memberProject} onClose={() => setMemberProject(null)} onUpdate={handleMemberUpdate} />
      )}

      {loading ? (
        <div className="board-loading">Đang tải dự án...</div>
      ) : projects.length === 0 ? (
        <div className="project-empty">
          <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
            {isPM ? 'Chưa có dự án nào.' : 'Bạn chưa được thêm vào dự án nào.'}
          </p>
          {isPM && <button className="btn-primary" onClick={openCreate}>Tạo dự án đầu tiên</button>}
        </div>
      ) : (
        <div className="project-grid">
          {projects.map(project => {
            const pmRole = isProjectPM(project)
            const myRole = getMyRole(project)
            const status = STATUS_LABELS[project.status] || STATUS_LABELS.active

            return (
              <div key={project._id} className="project-card" onClick={() => onSelectProject(project)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div className="project-card-name" style={{ margin: 0, flex: 1 }}>{project.name}</div>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, flexShrink: 0, marginLeft: 8,
                    background: status.color + '22', color: status.color, border: `1px solid ${status.color}44` }}>
                    {status.label}
                  </span>
                </div>

                <div className="project-card-desc">{project.description || 'Không có mô tả'}</div>

                {(project.startDate || project.endDate) && (
                  <div style={{ fontSize: 11, color: 'var(--text-faint)', margin: '8px 0', display: 'flex', gap: 12 }}>
                    {project.startDate && <span>📅 {new Date(project.startDate).toLocaleDateString('vi-VN')}</span>}
                    {project.endDate   && <span>🏁 {new Date(project.endDate).toLocaleDateString('vi-VN')}</span>}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '10px 0' }}>
                  {project.members?.slice(0, 5).map((m, i) => {
                    const name = m.user?.name || '?'
                    return (
                      <div key={i} title={name} style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, color: '#fff', fontWeight: 700,
                        border: '2px solid var(--card)', marginLeft: i > 0 ? -8 : 0 }}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )
                  })}
                  <span style={{ fontSize: 11, color: 'var(--text-faint)', marginLeft: 4 }}>
                    {project.members?.length || 1} thành viên
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 8px', borderRadius: 20,
                    background: (myRole.includes('PM') || myRole === 'Admin') ? '#f59e0b22' : '#3b82f622',
                    color:      (myRole.includes('PM') || myRole === 'Admin') ? '#f59e0b'   : '#3b82f6',
                    border: `1px solid ${(myRole.includes('PM') || myRole === 'Admin') ? '#f59e0b44' : '#3b82f644'}` }}>
                    {myRole}
                  </span>
                </div>

                <div className="project-card-actions" onClick={e => e.stopPropagation()}>
                  {pmRole && (
                    <button className="project-action-btn edit" onClick={e => openMembers(e, project)} title="Quản lý thành viên">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      Thành viên
                    </button>
                  )}
                  {pmRole && (
                    <button className="project-action-btn edit" onClick={e => openEdit(e, project)} title="Sửa dự án">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/>
                      </svg>
                      Sửa
                    </button>
                  )}
                  {isAdmin && (
                    <button className="project-action-btn delete" onClick={e => handleDelete(e, project)} title="Xoá dự án">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                      Xoá
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
