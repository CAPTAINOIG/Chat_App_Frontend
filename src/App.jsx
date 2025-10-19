import React from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Signup from './component/Signup'
import Signin from './component/Signin'
import Dashboard from './component/Dashboard'
import Chat from './component/Chat'
import Loader from './component/Loader'
import LandingPage from './component/LandingPage'
import RichTextEditor from './component/RichTextEditor'

function App() {


  return (
    <div className='font-[Mirza]'>
      <Routes>
        <Route path='/' element={<Loader />} />
        <Route path='/landingpage' element={<LandingPage />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/signin' element={<Signin />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path="/chat/:username" element={<Chat />} />
        <Route path="/editor" element={<RichTextEditor />} />
      </Routes>

    </div>
  )
}

export default App
