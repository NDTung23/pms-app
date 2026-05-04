import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { BoardProvider } from './context/BoardContext'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BoardProvider>
          <App />
        </BoardProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
