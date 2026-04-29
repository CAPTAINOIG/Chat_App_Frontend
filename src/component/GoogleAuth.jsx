import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { googleAuth } from "../api/authApi";
import useAuthStore from "../store/auth";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleAuth = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSuccess = async (response) => {
    try {
      const googleToken = response.credential;
      const res = await googleAuth(googleToken);
      let user, token;
      if (res.success && res.data) {
        user = res.data.user || res.data.userDetail;
        token = res.data.token || res.data.userToken;
      } else {
        user = res.userDetail || res.user;
        token = res.userToken || res.token;
      }
      
      if (user && token) {
        setAuth(user, token);
        toast.success(`Welcome back, ${user.username || user.name}!`);
        navigate("/dashboard");
      } else {
        throw new Error("Invalid response structure");
      }
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
