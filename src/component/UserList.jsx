import React, { useEffect, useRef, useState } from 'react'
import user from '../assets/image/user.png'
import { Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faEye } from '@fortawesome/free-solid-svg-icons';
import { FiMonitor } from 'react-icons/fi';
import { MdOutlineAccountCircle } from 'react-icons/md';
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5';
import { CiEdit, CiSettings, CiVideoOn } from 'react-icons/ci';
import { IoIosHelpCircleOutline, IoMdInformationCircleOutline, IoMdNotificationsOutline } from 'react-icons/io';
import { AiOutlineEdit } from 'react-icons/ai'
import { GrStorage } from 'react-icons/gr';
import { TbTableShortcut } from 'react-icons/tb';
import axios from 'axios';
import { toast } from 'react-toastify';

const baseUrl = "http://localhost:3000";
// const baseUrl = "https://chat-app-backend-seuk.onrender.com";



const UserList = ({ users, handleUserClick, accountOwner }) => {

    const userId = localStorage.getItem('userId');
    const [image, setImage] = useState(null)
    const [openToggle, setOpenToggle] = useState(false)
    const [editToggle, setEditToggle] = useState(false)
    const dropdownRef = useRef(null)
    const [loading, setLoading] = useState(false)
    const [viewImage, setViewImage] = useState(false);
    const [profileName, setProfileName] = useState('')
    const [aboutMe, setAboutMe] = useState('')
    const [isEditing, setIsEditing] = useState(false);
    const [editingField, setEditingField] = useState(null);

    let navigate = useNavigate();


    const data = [
        {
            icon: <FiMonitor />,
            text: 'General',
        },
        {
            icon: <MdOutlineAccountCircle />,
            text: 'Account',
        },
        {
            icon: <IoChatbubbleEllipsesOutline />,
            text: 'Chats',
        },
        {
            icon: <CiVideoOn />,
            text: 'Video & Audio',
        },
        {
            icon: <IoMdNotificationsOutline />,
            text: 'Notifications',
        },
        {
            icon: <GrStorage />,
            text: 'Storage',
        },
        {
            icon: <IoMdInformationCircleOutline />,
            text: 'Info',
        },
        {
            icon: <TbTableShortcut />,
            text: 'Shortcuts',
        },
        {
            icon: <CiSettings />,
            text: 'Settings',
        },
        {
            icon: <IoIosHelpCircleOutline />,
            text: 'Help',
        },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenToggle(false);
                setViewImage(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleAction = () => {
        setOpenToggle(!openToggle);
    };

    useEffect(() => {
        fetchProfilePic();
        getProfileUpdate();
    }, []);


    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target.result;
            console.log(base64);
            try {
                const response = await axios.post(`${baseUrl}/user/profilePicture`, {
                    userId: userId,
                    base64: base64,
                });
                console.log(response);
                fetchProfilePic();
            } catch (error) {
                console.log(error);
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
                // setOpenToggle(false);
                setLoading(false);
                setEditToggle(false)
            }
        } catch (error) {
            console.log(error);
            // toast.error("Failed to fetch profile picture.");
            setLoading(false);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        toast.info("Profile picture removed.");
    };

    const handleEdit = () => {
        setEditToggle(!editToggle)
    }

    const handleViewImage = () => {
        setViewImage(image)
    }

    const handleLogOut = () => {
        navigate('/signin');
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        // window.location.reload();
    };

    const handleUpdate = async () => {
        const data = { profileName, aboutMe }
        try {
            const response = await axios.put(`${baseUrl}/user/updateProfile/${userId}`, data)
            getProfileUpdate(userId)
            setIsEditing(false)
        } catch (error) {
            toast.error("Failed to update profile.")
        }
    }

    const getProfileUpdate = async () => {
        try {
            const response = await axios.get(`${baseUrl}/user/getUpdateProfile/`, {
                params: { userId: userId },
            })
            setProfileName(response?.data?.userDetail?.profileName)
            setAboutMe(response?.data?.userDetail?.aboutMe)
        } catch (error) {
        }
    }

    return (
        <div className="md:w-1/4 w-full p-4 border-b md:border-b-0 md:border-r border-gray-300 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 bg-gray-100 border-t rounded-sm p-1 border-gray-300">Users</h2>
            <div className="space-y-2">
                {users.length > 0 ? (
                    users.map((item, i) => (
                        <div
                            key={i}
                            className="p-2 cursor-pointer hover:bg-gray-300 hover:text-black text-gray-700 rounded bg-gray-100"
                            onClick={() => handleUserClick(item)}
                        >
                            <div className="flex items-center gap-5">
                                <div>
                                    {item?.profilePicture ? (
                                        <img
                                            className="w-12 h-12 rounded-full border-4 border-white object-cover"
                                            src={item.profilePicture}
                                            alt="Profile"
                                        />
                                    ) : (
                                        <img
                                            className="w-12 h-12 rounded-full border-4 border-white object-cover"
                                            src={user}
                                            alt="Profile"
                                        />
                                    )}
                                </div>
                                <span>{item?.username || 'Unknown User'}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500">No users available</p>
                )}
            </div>

            <div onClick={handleAction} className='fixed bottom-0 left-0 items-center  rounded-full border-white border m-2'>
                <Tooltip title="profile">
                    {loading ? (
                        <div className="w-14 h-14 rounded-full border-4 border-white bg-gray-300 animate-pulse"></div>
                    ) : image ? (
                        <div>
                            <img
                                className="w-10 h-10 rounded-full object-cover"
                                src={image}
                                alt="Profile"
                            />
                        </div>
                    ) : (
                        <div>
                            <img
                                className="w-14 h-14 rounded-full object-cover"
                                src={user}
                                alt="Profile"
                            />
                        </div>
                    )}
                </Tooltip>
            </div>

            {openToggle && (
                <motion.div ref={dropdownRef}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-24 left-2 w-1/2 z-50 bg-white shadow-lg rounded-lg border border-gray-200"
                >
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='bg-gray-400 rounded-lg'>
                            {data?.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-300 rounded-full"
                                    onClick={() => handleAction(item?.text, item?.icon)}
                                >
                                    {item?.icon}
                                    <span>{item?.text}</span>
                                </div>
                            ))}
                        </div>
                        <div className='p-3 relative group'>
                            <div>
                                {image ? (
                                    <div>
                                        <img className="w-28 mx-auto h-28 rounded-full object-cover" src={image} alt="Profile" />
                                    </div>
                                ) : (
                                    <div>
                                        <img className="w-28 h-28 mx-auto rounded-full object-cover" src={user} alt="Profile" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <div>
                                    <div className="font-semibold flex gap-5 items-center text-xl mt-5 text-center">
                                        <AnimatePresence mode="wait">
                                            {isEditing && editingField === 'profileName' ? (
                                                <motion.input
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    required
                                                    className="border border-default-200 bg-transparent text-lg leading-tight w-[200px] py-2 px-3 rounded-2xl"
                                                    value={profileName}
                                                    onChange={(e) => setProfileName(e.target.value)}
                                                    onBlur={handleUpdate}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                                                    autoFocus
                                                />
                                            ) : (
                                                <motion.p
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    onClick={() => { setIsEditing(true); setEditingField('profileName'); }}
                                                    className="text-lg font-medium leading-tight border border-transparent hover:border-default-200 py-2 px-3 rounded-2xl cursor-pointer"
                                                >
                                                    {profileName || 'Enter your name'}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                        <div>
                                        <AiOutlineEdit className="text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => setIsEditing(true)} />
                                        </div>
                                    </div>

                                    <p className='text-gray-500 ms-3'>About</p>
                                    <AnimatePresence mode="wait">
                                        {isEditing && editingField === 'aboutMe' ? (
                                            <motion.textarea
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="w-full h-24 rounded-lg p-2 border border-default-200 bg-transparent"
                                                placeholder="About Me"
                                                value={aboutMe}
                                                onChange={(e) => setAboutMe(e.target.value)}
                                                onBlur={handleUpdate}
                                                autoFocus
                                            />
                                        ) : (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                onClick={() => { setIsEditing(true); setEditingField('aboutMe'); }}
                                                className="w-full text-lg font-medium leading-tight border border-transparent hover:border-default-200 py-2 px-3 rounded-2xl cursor-pointer"
                                            >
                                                {aboutMe || 'Write something about yourself'}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                    {/* <button onClick={handleUpdate}>Update Profile</button> */}
                                </div>
                                <p className='text-gray-500 ms-3'>Phone number</p>
                                <p className='ms-3'>{accountOwner?.number}</p>
                                <div className='border border-b mt-3'></div>
                                <button onClick={handleLogOut} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none mt-3 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Log out</button>
                            </div>
                            <div className='group-hover:flex top-[12%] left-[42%] hidden cursor-pointer absolute items-center'>
                                <CiEdit onClick={handleEdit} className="text-white bg-black opacity-50 p-2 ms-2 rounded-full" size={40} />
                            </div>
                            {editToggle && (
                                <section className='bg-gray-200 rounded-lg absolute top-[-23%] left-[20%] w-40 h-24 items-center'>
                                    <div>
                                        <button
                                            onClick={() => document.getElementById("avatarInput").click()}
                                            className="text-green-700 absolute hover:bg-gray-600 hover:text-white w-full rounded py-1 top-[3%] left-[0%] px-2 cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faEdit} className="mr-2" /> Change Image
                                        </button>
                                    </div>
                                    <input
                                        type="file"
                                        id="avatarInput"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                    />
                                    <div>
                                        <button
                                            onClick={handleRemoveImage}
                                            className="text-orange-600 absolute top-[35%] hover:text-white hover:bg-gray-600 w-full rounded py-1 left-[0%] px-2 cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="mr-2" /> Remove Image
                                        </button>
                                    </div>

                                    <div>
                                        <button
                                            onClick={handleViewImage}
                                            className="text-blue-600 absolute top-[65%] hover:text-white hover:bg-gray-600 w-full rounded py-1 left-[0%] px-2 cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faEye} className="mr-2" /> View Image
                                        </button>
                                    </div>
                                    {viewImage && (
                                        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
                                            <div className="bg-white p-4 rounded-lg">
                                                <img className="w-full h-full object-cover rounded-lg" src={viewImage} alt="Full-size Profile" />
                                                <button
                                                    onClick={() => setViewImage(null)}
                                                    className="absolute top-2 right-10 h-10 w-10 hover:text-red-600 text-white bg-gray-300 p-2 rounded-full"
                                                >
                                                    X
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                </section>
                            )}
                        </div>
                    </div>

                </motion.div>
            )}

        </div>
    )
};


export default UserList