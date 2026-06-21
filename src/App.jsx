import React, { useEffect } from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Signup from './component/Signup'
import Signin from './component/Signin'
import Dashboard from './component/Dashboard'
import Chat from './component/Chat'
import Loader from './component/Loader'
import LandingPage from './component/LandingPage'
import { AuthProvider } from './component/AuthProvider'
import ProtectedRoute from './component/ProtectedRoute'
import ErrorBoundary from './component/ErrorBoundary'
import ForgotPassword from './component/ForgotPassword'
import ResetPassword from './component/ResetPassword'
import { useUserStore } from './store/user'

function App() {
  const theme = useUserStore((state) => state.theme)
  const fontSize = useUserStore((state) => state.fontSize)  

  useEffect(() => {
    const root = window.document.documentElement
    
    const applyTheme = (isDark) => {
      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mediaQuery.matches)

      const handleSystemThemeChange = (e) => applyTheme(e.matches)
      mediaQuery.addEventListener('change', handleSystemThemeChange)
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
    } else {
      applyTheme(theme === 'dark')
    }
  }, [theme])

  useEffect(() => {
    const sizes = {
      small: "14px",
      medium: "16px",
      large: "18px",
    };
    document.documentElement.style.fontSize = sizes[fontSize] || "16px";
  }, [fontSize]);
  
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="font-sans min-h-screen">
          <Routes>
            <Route path='/' element={<Loader />} />
            <Route path='/landingpage' element={<LandingPage />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/signin' element={<Signin />} />
            <Route path='/forgot-password' element={<ForgotPassword/>} />
            <Route path='/reset-password' element={<ResetPassword/>} />
            <Route 
              path='/dashboard' 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat/:username" 
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
