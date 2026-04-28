import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'

const Loader = () => {
    const [myLoader, setMyLoader] = useState(true)
    let navigate = useNavigate()
    
    useEffect(() => {
      const timer = setTimeout(() => {
        setMyLoader(false)
        navigate('/landingpage')
      }, 3000);
      return () => clearTimeout(timer);
    }, [navigate]);
    
  return (
    <div className='bg-surface-900 h-screen flex items-center justify-center'>
        <section className='text-center'>
            {myLoader && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-surface-300 text-lg font-semibold">Loading ChatterBox...</p>
              </div>
            )}
        </section>
    </div>
  )
}

export default Loader