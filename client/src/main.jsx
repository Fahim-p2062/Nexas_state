import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#161616',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
            },
            success: { iconTheme: { primary: 'greenyellow', secondary: '#161616' } },
            error: { iconTheme: { primary: '#ff7b7b', secondary: '#161616' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
