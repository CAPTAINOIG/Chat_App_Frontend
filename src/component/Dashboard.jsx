import axios from 'axios';
import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

const Dashboard = () => {
    let token = localStorage.getItem('userToken')
    console.log(token);

    let userId = localStorage.getItem('userId')
    console.log(userId);

    let username = localStorage.getItem('username')
    console.log(username);

    const navigate = useNavigate()

    let endpoint = 'http://localhost:3000/user/dashboard'
    useEffect(() => {
        if(!token){
            navigate('/signin')
        }
      axios.get(endpoint, {
        headers: {
            "Authorization": `Bearer: ${token}`,
            "Content-Type": 'application/json',
            "Accept": 'application/json'
        },
      })
      .then((result)=>{
        console.log(result.data);
        localStorage.setItem('username', (res.data.userDetail.username))
      })
      .catch((err)=>{
        console.log(err);
        if (err.result.data) {
            setLoader(false);
            // console.log("Token has expired");
            toast.error("Token has expired");
            localStorage.removeItem("token");
            navigate("/signin");
          }
      })
    }, [token, navigate])
    

  return (
    <div>
        <div>Dashboard</div>
        {/* <Link className='bg-blue-700 p-2' to="/chat"></Link> */}
        <Link to={`/chat/${username}`}>Chat with User</Link>
        <ToastContainer/>
    </div>
  )
}

export default Dashboard