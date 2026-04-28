import React from 'react'
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

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className='font-sans'>
          <Routes>
            <Route path='/' element={<Loader />} />
            <Route path='/landingpage' element={<LandingPage />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/signin' element={<Signin />} />
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
