import React, { useEffect, useRef, useState } from 'react'
import user from '../assets/image/user.png'
import { Tooltip } from 'antd';
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { FiMonitor } from 'react-icons/fi';
import { MdOutlineAccountCircle } from 'react-icons/md';
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5';
import { CiSettings, CiVideoOn } from 'react-icons/ci';
import { IoIosHelpCircleOutline, IoMdInformationCircleOutline, IoMdNotificationsOutline } from 'react-icons/io';
import { GrStorage } from 'react-icons/gr';
import { TbTableShortcut } from 'react-icons/tb';


const UserList = ({ users, handleUserClick, accountOwner, image }) => {
    // console.log(image)
    // const userId = localStorage.getItem('userId');
    // console.log(userId)
    // const [image, setImage] = useState(null)
    console.log(accountOwner)
    const [openToggle, setOpenToggle] = useState(false)
    const dropdownRef = useRef(null)

    // if (accountOwner?.length > 0) {
    //     const accountOwnerImage = accountOwner?.find((user) => user?._id === userId);
    // console.log(accountOwnerImage)
    // setImage(accountOwnerImage?.profilePicture)
    // }
    // const image = accountOwnerImage?.profilePicture;
    // const accountOwnerImage = accountOwner?.find((user) => user?._id === userId);
    // console.log(accountOwnerImage)

    // const image = accountOwnerImage?.profilePicture;

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

    const handleRemoveImage = (id) => {
        const newImages = images.filter((image) => image.id !== id);
        setImages(newImages);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        // reader.onload = () => {
        //     setImages(newImages);
        // };
    };

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
                    {accountOwner?.profilePicture ? (
                        <div>
                            <img
                                className="w-10 h-10 rounded-full object-cover"
                                src={accountOwner?.profilePicture}
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

            <input
                type="file"
                id="avatarInput"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
            />
            {openToggle && (
                <motion.div ref={dropdownRef}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-20 left-2 w-1/4 z-50 bg-white shadow-lg rounded-lg border border-gray-200"
                >
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='bg-gray-400'>
                            {data?.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-300 rounded-full"
                                    onClick={() => handleAction(item?.text, msg.content, msg?.messageId, msg?.receiverId, msg?.senderId)}
                                >
                                    {item?.icon}
                                    <span>{item?.text}</span>
                                </div>
                            ))}
                        </div>
                        <div className='p-3'>
                            <div>
                                    {accountOwner?.profilePicture ? (
                                        <div>
                                            <img className="w-20 h-20 rounded-full object-cover" src={accountOwner?.profilePicture} alt="Profile"/>
                                        </div>
                                    ) : (
                                        <div>
                                            <img className="w-14 h-14 rounded-full object-cover" src={user} alt="Profile" />
                                        </div>
                                    )}
                            </div>
                            <button
                                onClick={() => document.getElementById("avatarInput").click()}
                                className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                            >
                                <FontAwesomeIcon icon={faEdit} className="mr-2" /> Change Image
                            </button>
                            <input type="text" id='avatarInput' className="hidden" accept="image/*" />

                            <button
                                onClick={handleRemoveImage}
                                className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100"
                            >
                                <FontAwesomeIcon icon={faTrash} className="mr-2" /> Remove Image
                            </button>

                        </div>
                    </div>

                </motion.div>
            )}

        </div>
    )
};


export default UserList