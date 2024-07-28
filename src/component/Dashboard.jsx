import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

// const baseUrl = 'https://chat-app-backend-seuk.onrender.com';
const baseUrl = "http://localhost:3000";

const Dashboard = () => {
  const token = localStorage.getItem('userToken');
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  
  const navigate = useNavigate();

  const endpoint = `${baseUrl}/user/dashboard`;

  useEffect(() => {
    const checkTokenAndFetchData = async () => {
      if (!token) {
        navigate('/signin');
        return;
      }

      try {
        const response = await axios.get(endpoint, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": 'application/json',
            "Accept": 'application/json'
          },
        });
        // Assuming the response data structure has `userDetail.username`
        localStorage.setItem('username', response.data.userDetail.username);

      } catch (err) {
        // Handle token expiration or other errors
        if (err.response && err.response.status === 401) { // Unauthorized status code
          setLoader(false);
          toast.error("Token has expired or is invalid");
          localStorage.removeItem('userToken');
          navigate('/signin');
        } else {
          // Handle other errors
          console.error("Error fetching data:", err);
          toast.error("An error occurred. Please try again later.");
        }
      }
    };

    checkTokenAndFetchData();
  }, [token, navigate, endpoint]);

  const handleChat = () => {
    navigate(`/chat/${username}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-800">
      <div className="bg-white p-3 hover:bg-blue-200 hover:text-blue-800 cursor-pointer text-blue-800 rounded-lg shadow-md" onClick={handleChat}>
        <Link to={`/chat/${username}`}>Chat with User</Link>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Dashboard;
