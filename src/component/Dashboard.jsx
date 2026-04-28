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
      <div className="min-h-screen flex items-center justify-center bg-surface-900">
        <div className="text-surface-50 flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900">
      <Toaster position="top-center" />
      <div
        className="bg-surface-800 border border-surface-700 p-6 hover:bg-primary-600 hover:border-primary-500 cursor-pointer text-surface-50 rounded-2xl shadow-card transition-all"
        onClick={handleChat}
      >
        <p className="text-lg font-semibold">Start Chatting</p>
      </div>
    </div>
  );
};

export default Dashboard;
