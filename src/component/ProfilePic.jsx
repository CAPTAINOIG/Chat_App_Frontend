import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import user1 from '../assets/image/user1.png';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const baseUrl = "http://localhost:3000";

const ProfilePic = ({selectedUser, setImage, image}) => {
    const accountOwner = localStorage.getItem('userId');

    // const [image, setImage] = useState(null);
    const [openToggle, setOpenToggle] = useState(false);
    const [otherUsersToggle, setotherUsersToggle] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAction = () => {
        if (selectedUser === accountOwner) {
            setOpenToggle(!openToggle);
        }else{
            setotherUsersToggle(!otherUsersToggle);
            // toast.error("You can't change profile picture of other users.");
        }
        // setOpenToggle(!openToggle);
    };

    useEffect(() => {
        fetchProfilePic();
    }, [selectedUser]);
    

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target.result;
            try {
                const response = await axios.post(`${baseUrl}/user/profilePicture`, {
                    userId: selectedUser,
                    base64: base64,
                });
                // console.log(response);
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
                params: { userId: selectedUser },
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
                    <div className="w-14 h-14 rounded-full border-4 border-white bg-gray-300 animate-pulse"></div>
                ) : ( 
                    <img 
                        className="w-14 h-14 rounded-full border-4 border-white object-cover" 
                        src={image || user1} 
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

            {openToggle && selectedUser && (
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


            <div>
            {otherUsersToggle && selectedUser && (
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
                        <FontAwesomeIcon icon={faEdit} className="mr-2" /> Lorem ipsum dolor sit amet, consectetur adipisicing elit. Libero autem consectetur quaerat expedita, beatae quasi voluptas voluptate! Molestias debitis accusantium eligendi porro sit voluptatem dicta aliquid iusto temporibus cupiditate sunt neque perferendis mollitia quibusdam, unde impedit dignissimos tempora pariatur soluta, delectus dolorem. Voluptate cum eligendi, minima nobis suscipit sunt a assumenda expedita animi ipsum quibusdam ducimus facilis voluptatibus temporibus quaerat quis molestias non omnis dicta incidunt fugiat labore dignissimos? Molestiae ex fuga praesentium sapiente! Ut asperiores deleniti cumque eligendi. Excepturi ex minus non dolorum deserunt distinctio ipsum laboriosam expedita eum? Voluptas, tempore similique sunt debitis autem omnis repellendus officiis repudiandae!
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
        </div>
    );
};

export default ProfilePic;
