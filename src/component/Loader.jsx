import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'

const Loader = () => {
    const [myLoader, setMyLoader] = useState(true)
    let navigate = useNavigate()
    
    useEffect(() => {
      const timer = setTimeout(() => {
        setMyLoader(false)
        navigate('/signup')
      }, 3000);
      return () => clearTimeout(timer);
    }, [navigate]);
    
  return (
    <div className='bg-gray-400 h-screen'>
        <section className='text-center'>
            {
                myLoader && ( <ClipLoader className='text-center mt-[20%]' size={50} color={"#000000"} />)
            }
        </section>
    </div>
  )
}

export default Loader