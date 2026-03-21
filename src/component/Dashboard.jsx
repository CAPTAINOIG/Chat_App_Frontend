import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { dashboard } from "../api/authApi";
import { useAuth } from "./AuthProvider";

const Dashboard = () => {
  const { user, username, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenAndFetchData = async () => {
      if (!isAuthenticated) {
        navigate("/signin");
        return;
      }
      try {
        const response = await dashboard();
        // Auth store will be updated automatically if needed
      } catch (err) {
        if (err.response && err.response.status === 401) {
          toast.error("Token has expired or is invalid");
          logout();
          navigate("/signin");
        } else {
          toast.error("An error occurred. Please try again later.");
        }
      }
    };

    if (!isLoading) {
      checkTokenAndFetchData();
    }
  }, [isAuthenticated, isLoading, navigate, logout]);

  const handleChat = () => {
    navigate(`/chat/${username}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-800">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

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
