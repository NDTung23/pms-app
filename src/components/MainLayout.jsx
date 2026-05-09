import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import TabBar from './TabBar'
import BoardView from './BoardView'
import PlannerView from './PlannerView'
import ReportView from './ReportView'
import InboxView from './InboxView'
import SprintView from './SprintView'
import ChatView from './ChatView'
import FinanceView from './FinanceView'
import ProjectPage from '../pages/ProjectPage'
import AdminPage from './AdminPage'

export default function MainLayout() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab]     = useState(
    () => localStorage.getItem('pms_active_tab') || 'projects'
  )
  const [selectedProject, setSelectedProject] = useState(() => {
    try {
      const s = localStorage.getItem('pms_selected_project')
      return s ? JSON.parse(s) : null
    } catch { return null }
  })

  const handleSelectProject = (project) => {
    setSelectedProject(project)
    localStorage.setItem('pms_selected_project', JSON.stringify(project))
    handleSetTab('board')
  }

  const handleSetTab = (tab) => {
    setActiveTab(tab)
    localStorage.setItem('pms_active_tab', tab)
    setSidebarOpen(false)
  }

  const projectId = selectedProject?._id

  return (
    <div className="app">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <Navbar
        onMenuClick={() => setSidebarOpen(o => !o)}
        onCreateProject={() => handleSetTab('projects')}
        onTabChange={handleSetTab}
      />

      <div className="app-body">
        <Sidebar
          open={sidebarOpen}
          activeTab={activeTab}
          setActiveTab={handleSetTab}
          selectedProject={selectedProject}
          onSelectProject={() => handleSetTab('projects')}
          isAdmin={user?.role === 'admin'}
        />

        <main className="main-content">
          {activeTab === 'projects' && (
            <ProjectPage onSelectProject={handleSelectProject} />
          )}

          {activeTab === 'board' && selectedProject ? (
            <BoardView
              projectId={projectId}
              projectName={selectedProject.name}
              onBackToProjects={() => handleSetTab('projects')}
            />
          ) : activeTab === 'board' && !selectedProject && (
            <ProjectPage onSelectProject={handleSelectProject} />
          )}

          {activeTab === 'sprint'   && <SprintView  projectId={projectId} />}
          {activeTab === 'finance'  && <FinanceView  projectId={projectId} />}
          {activeTab === 'chat'     && <ChatView     projectId={projectId} />}
          {activeTab === 'planner'  && <PlannerView />}
          {activeTab === 'report'   && <ReportView   projectId={projectId} />}
          {activeTab === 'inbox'    && <InboxView />}
          {activeTab === 'admin'    && user?.role === 'admin' && <AdminPage />}
        </main>
      </div>

      <TabBar activeTab={activeTab} setActiveTab={handleSetTab} />
    </div>
  )
}
