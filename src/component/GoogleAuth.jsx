import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { googleAuth } from "../api/authApi";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleAuth = () => {
  const navigate = useNavigate();

  const handleSuccess = async (response) => {
    try {
      const googleToken = response.credential;
      const res = await googleAuth(googleToken);
      localStorage.setItem("userToken", res?.userToken);
      localStorage.setItem("username", res?.userDetail?.username);
      localStorage.setItem("userId", res?.userDetail?._id);
      toast.success(`Welcome back, ${res?.username}!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error("Authentication failed");
    }
  };

  const handleFailure = (error) => {
    toast.error("Google Sign-In failed.");
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
        <Toaster position="top-center" />   
      <div className="flex flex-col items-center space-y-4 w-full">
        <GoogleLogin onSuccess={handleSuccess} onError={handleFailure} />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;
