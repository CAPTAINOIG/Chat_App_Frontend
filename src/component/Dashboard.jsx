import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { dashboard } from "../api/authApi";

const Dashboard = () => {
  const token = localStorage.getItem("userToken");
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenAndFetchData = async () => {
      if (!token) {
        navigate("/signin");
        return;
      }
      try {
        const response = await dashboard();
        localStorage.setItem("username", response.userDetail.username);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          toast.error("Token has expired or is invalid");
          localStorage.removeItem("userToken");
          navigate("/signin");
        } else {
          toast.error("An error occurred. Please try again later.");
        }
      }
    };

    checkTokenAndFetchData();
  }, [token, navigate]);

  const handleChat = () => {
    navigate(`/chat/${username}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-800">
      <Toaster position="top-center" />
      <div
        className="bg-white p-3 hover:bg-blue-200 hover:text-blue-800 cursor-pointer text-blue-800 rounded-lg shadow-md"
        onClick={handleChat}
      >
        <p>Chat with User</p>
      </div>
    </div>
  );
};

export default Dashboard;
