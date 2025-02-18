import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID; 
const baseUrl = 'https://chat-app-backend-seuk.onrender.com';
// const baseUrl = "http://localhost:3000";


const GoogleAuth = () => {
    const navigate = useNavigate();

    const endpoint = `${baseUrl}/user/googleAuth`;

    const handleSuccess = async (response) => {
        try {
          const googleToken = response.credential;
          const res = await axios.post(endpoint, { googleToken });
            localStorage.setItem('userToken', res?.data?.userToken);
            localStorage.setItem('username', res?.data?.userDetail?.username);
            localStorage.setItem('userId', res.data?.userDetail?._id);
            toast.success(`Welcome back, ${res?.data?.username}!`);
            navigate('/dashboard');
        } catch (err) {
          toast.error('Authentication failed');
        }
      };
      

    const handleFailure = (error) => {
        toast.error("Google Sign-In failed.");
    };

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <div className="flex flex-col items-center space-y-4 w-full">
                <GoogleLogin 
                    onSuccess={handleSuccess} 
                    onError={handleFailure} 
                />
            </div>
            <ToastContainer />
        </GoogleOAuthProvider>
    );
};

export default GoogleAuth;
