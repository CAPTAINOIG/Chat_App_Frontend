import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import user06 from '../assets/image/user06.png';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const baseUrl = "http://localhost:3000";

const ProfilePic = () => {
    const userId = localStorage.getItem('userId');

    const [image, setImage] = useState(null);
    const [openToggle, setOpenToggle] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAction = () => {
        setOpenToggle(!openToggle);
    };

    useEffect(() => {
        fetchProfilePic();
    }, [userId]);
    

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target.result;
            try {
                const response = await axios.post(`${baseUrl}/user/profilePicture`, {
                    userId: userId,
                    base64: base64,
                });
                fetchProfilePic();
            } catch (error) {
                toast.error("Failed to upload image.");
                setLoading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const fetchProfilePic = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${baseUrl}/user/fetchPicture`, {
                params: { userId: userId },
            });
            if (response?.data?.url) {
                setImage(response?.data?.url);
                setOpenToggle(false);
                setLoading(false);
            }
        } catch (error) {
            toast.error("Failed to fetch profile picture.");
            setLoading(false);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setOpenToggle(false);
        toast.info("Profile picture removed.");
    };

    return (
        <div className="relative flex flex-col items-center">
             <label className="relative cursor-pointer" onClick={handleAction}>
                {loading ? (
                    <div className="w-10 h-10 rounded-full border-4 border-white bg-gray-300 animate-pulse"></div>
                ) : (
                    <img 
                        className="w-10 h-10 rounded-full border-4 border-white object-cover" 
                        src={image || user06} 
                        alt="Profile" 
                    />
                )}
            </label>

            <input 
                type="file" 
                id="avatarInput" 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload} 
            />

            {openToggle && userId && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-16 right-[-10px] w-48 bg-white shadow-lg rounded-lg border border-gray-200"
                >
                    <button 
                        onClick={() => document.getElementById("avatarInput").click()} 
                        className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                        <FontAwesomeIcon icon={faEdit} className="mr-2" /> Change Image
                    </button>

                    <button 
                        onClick={handleRemoveImage} 
                        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                        <FontAwesomeIcon icon={faTrash} className="mr-2" /> Remove Image
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default ProfilePic;
