import { useState, useEffect } from 'react'
import { getProjectsAPI, createProjectAPI, updateProjectAPI, deleteProjectAPI } from '../services/projectService'
import MemberModal from '../components/MemberModal'
import { useAuth } from '../hooks/useAuth'

export default function ProjectPage({ onSelectProject }) {
  const { user }                          = useAuth()
  const [projects, setProjects]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [showForm, setShowForm]           = useState(false)
  const [editProject, setEditProject]     = useState(null)
  const [memberProject, setMemberProject] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })

  useEffect(() => {
    getProjectsAPI()
      .then(res => setProjects(res.data?.data || res.data || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [])

  // Kiểm tra quyền với từng project
  const isPM = (project) => {
    if (!user) return false
    if (user.role === 'admin') return true
    const member = project.members?.find(m => (m.user?._id || m.user) === user._id)
    return member?.role === 'pm' || project.owner?._id === user._id || project.owner === user._id
  }

  const openCreate = () => {
    setEditProject(null)
    setForm({ name: '', description: '' })
    setShowForm(true)
  }

  const openEdit = (e, project) => {
    e.stopPropagation()
    setEditProject(project)
    setForm({ name: project.name, description: project.description || '' })
    setShowForm(true)
  }

  const openMembers = (e, project) => {
    e.stopPropagation()
    setMemberProject(project)
  }

  const handleDelete = async (e, project) => {
    e.stopPropagation()
    if (!window.confirm(`Xoá dự án "${project.name}"?`)) return
    try {
      await deleteProjectAPI(project._id)
      setProjects(prev => prev.filter(p => p._id !== project._id))
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi xoá dự án')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
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
      setForm({ name: '', description: '' })
      setEditProject(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi lưu dự án')
    }
  }

  const handleMemberUpdate = (updatedProject) => {
    setProjects(prev => prev.map(p => p._id === updatedProject._id ? updatedProject : p))
    setMemberProject(updatedProject)
  }

  return (
    <div className="project-page">
      <div className="project-header">
        <h1 className="project-title">Dự án của tôi</h1>
        <button className="btn-primary" onClick={openCreate}>+ Tạo dự án</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
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
                <div className="modal-field">
                  <label className="modal-label">Tên dự án *</label>
                  <input className="modal-input" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Nhập tên dự án..." autoFocus />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Mô tả</label>
                  <textarea className="modal-input modal-textarea" value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Mô tả ngắn..." rows={3} />
                </div>
              </div>
              <div className="modal-footer">
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Huỷ</button>
                  <button type="submit" className="btn-primary">{editProject ? 'Lưu' : 'Tạo dự án'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {memberProject && (
        <MemberModal
          project={memberProject}
          onClose={() => setMemberProject(null)}
          onUpdate={handleMemberUpdate}
        />
      )}

      {loading ? (
        <div className="board-loading">Đang tải dự án...</div>
      ) : projects.length === 0 ? (
        <div className="project-empty">
          <p>Chưa có dự án nào.</p>
          <button className="btn-primary" onClick={openCreate}>Tạo dự án đầu tiên</button>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map(project => {
            const pm = isPM(project)
            const isAdmin = user?.role === 'admin'
            return (
              <div key={project._id} className="project-card" onClick={() => onSelectProject(project)}>
                <div className="project-card-name">{project.name}</div>
                <div className="project-card-desc">{project.description || 'Không có mô tả'}</div>
                <div className="project-card-meta">
                  <span>{project.members?.length || 1} thành viên</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {pm && (
                      <span className="member-role" style={{
                        background: '#f59e0b22', color: '#f59e0b', border: '1px solid #f59e0b44',
                        fontSize: 10, padding: '1px 6px', borderRadius: 20,
                      }}>
                        {isAdmin ? 'Admin' : 'PM'}
                      </span>
                    )}
                    <span className={`project-status ${project.status}`}>{project.status}</span>
                  </div>
                </div>
                <div className="project-card-actions">
                  {pm && (
                    <button className="project-action-btn edit" onClick={e => openMembers(e, project)} title="Quản lý thành viên">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </button>
                  )}
                  {pm && (
                    <button className="project-action-btn edit" onClick={e => openEdit(e, project)} title="Sửa">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  )}
                  {isAdmin && (
                    <button className="project-action-btn delete" onClick={e => handleDelete(e, project)} title="Xoá">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
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
