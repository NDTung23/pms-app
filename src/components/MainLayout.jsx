import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import TabBar from './TabBar'
import BoardView from './BoardView'
import PlannerView from './PlannerView'
import ReportView from './ReportView'
import InboxView from './InboxView'
import ProjectPage from '../pages/ProjectPage'
import AdminPage from '../pages/AdminPage'

export default function MainLayout() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab]     = useState(
    () => localStorage.getItem('pms_active_tab') || 'projects'
  )
  const [selectedProject, setSelectedProject] = useState(() => {
    try {
      const saved = localStorage.getItem('pms_selected_project')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  const handleSelectProject = (project) => {
    setSelectedProject(project)
    localStorage.setItem('pms_selected_project', JSON.stringify(project))
    handleSetActiveTab('board')
  }

  const handleBackToProjects = () => handleSetActiveTab('projects')

  const handleSetActiveTab = (tab) => {
    setActiveTab(tab)
    localStorage.setItem('pms_active_tab', tab)
  }

  return (
    <div className="app">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <Navbar onMenuClick={() => setSidebarOpen(o => !o)} />

      <div className="app-body">
        <Sidebar
          open={sidebarOpen}
          activeTab={activeTab}
          setActiveTab={handleSetActiveTab}
          selectedProject={selectedProject}
          onSelectProject={() => handleSetActiveTab('projects')}
          isAdmin={user?.role === 'admin'}
        />

        <main className="main-content">
          {activeTab === 'projects' && (
            <ProjectPage onSelectProject={handleSelectProject} />
          )}
          {activeTab === 'board' && selectedProject && (
            <BoardView
              projectId={selectedProject._id}
              projectName={selectedProject.name}
              onBackToProjects={handleBackToProjects}
            />
          )}
          {activeTab === 'board' && !selectedProject && (
            <ProjectPage onSelectProject={handleSelectProject} />
          )}
          {activeTab === 'planner' && <PlannerView />}
          {activeTab === 'report'  && <ReportView />}
          {activeTab === 'inbox'   && <InboxView />}
          {activeTab === 'admin'   && user?.role === 'admin' && <AdminPage />}
        </main>
      </div>

      <TabBar activeTab={activeTab} setActiveTab={handleSetActiveTab} />
    </div>
  )
}
