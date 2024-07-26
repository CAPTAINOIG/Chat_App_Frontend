import React from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Signup from './component/Signup'
import Signin from './component/Signin'
import Dashboard from './component/Dashboard'
import Chat from './component/Chat'

function App() {
  

  return (
    <div className='font-[Mirza]'>
      <Routes>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/signin' element={<Signin/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path="/chat/:username" element={<Chat />} />
      </Routes>
        
    </div>
  )
}

export default App
