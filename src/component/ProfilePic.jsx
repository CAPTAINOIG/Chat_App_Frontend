import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import user from "../assets/image/user.png";
import React, { useEffect, useRef, useState } from "react";
import user1 from "../assets/image/user1.png";
import { motion } from "framer-motion";
import { FiMonitor } from "react-icons/fi";
import { MdOutlineAccountCircle } from "react-icons/md";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { CiSettings, CiVideoOn } from "react-icons/ci";
import {
  IoIosHelpCircleOutline,
  IoMdInformationCircleOutline,
  IoMdNotificationsOutline,
} from "react-icons/io";
import { GrStorage } from "react-icons/gr";
import { TbTableShortcut } from "react-icons/tb";
import { Toaster, toast } from "sonner";

// const baseUrl = "http://localhost:3000";
const baseUrl = "https://chat-app-backend-seuk.onrender.com";

const ProfilePic = ({ selectedUser, setImage, image }) => {
  const accountOwner = localStorage.getItem("userId");
  const [openToggle, setOpenToggle] = useState(false);
  const [otherUsersToggle, setotherUsersToggle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewImage, setViewImage] = useState(false);

  const dropdownRef = useRef(null);

  const data = [
    {
      icon: <FiMonitor />,
      text: "General",
    },
    {
      icon: <MdOutlineAccountCircle />,
      text: "Account",
    },
    {
      icon: <IoChatbubbleEllipsesOutline />,
      text: "Chats",
    },
    {
      icon: <CiVideoOn />,
      text: "Video & Audio",
    },
    {
      icon: <IoMdNotificationsOutline />,
      text: "Notifications",
    },
    {
      icon: <GrStorage />,
      text: "Storage",
    },
    {
      icon: <IoMdInformationCircleOutline />,
      text: "Info",
    },
    {
      icon: <TbTableShortcut />,
      text: "Shortcuts",
    },
    {
      icon: <CiSettings />,
      text: "Settings",
    },
    {
      icon: <IoIosHelpCircleOutline />,
      text: "Help",
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setotherUsersToggle(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAction = (selectedUser) => {
    if (selectedUser === accountOwner) {
      setOpenToggle(!openToggle);
    } else {
      setotherUsersToggle(!otherUsersToggle);
      // toast.error("You can't change profile picture of other users.");
    }
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

  const handleViewImage = () => {
    setViewImage(image);
  };

  return (
    <div className="relative flex flex-col items-center">
      <Toaster position="top-center" />
      <label
        className="cursor-pointer"
        onClick={() => handleAction(selectedUser)}
      >
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
        {otherUsersToggle && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute top-16 right-[-10px] w-96 bg-white shadow-lg rounded-lg border border-gray-200"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-400 rounded-lg">
                {data?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-300 rounded-full"
                    onClick={() => handleAction(item?.text, msg?.icon)}
                  >
                    {item?.icon}
                    <span>{item?.text}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 relative group">
                <div onClick={handleViewImage}>
                  {image ? (
                    <div>
                      <img
                        className="w-28 mx-auto h-28 rounded-full object-cover"
                        src={image}
                        alt="Profile"
                      />
                    </div>
                  ) : (
                    <div>
                      <img
                        className="w-28 h-28 mx-auto rounded-full object-cover"
                        src={user}
                        alt="Profile"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-xl mt-5 text-center">
                    {selectedUser?.username}
                  </p>
                  <p className="text-gray-500">About</p>
                  <p>
                    Astral Tech Academy|| Full stack web developer|| Sport
                    Analyst|| Captain OIG
                  </p>
                  <p className="text-gray-500">Phone number</p>
                  <p>{selectedUser?.number}</p>
                  <div className="border border-b mt-3"></div>
                </div>

                {viewImage && (
                  <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
                    <div className="rounded-lg w-[50%] h-[100%]">
                      <img
                        className="w-full h-full object-cover rounded-lg"
                        src={viewImage}
                        alt="Full-size Profile"
                      />
                      <button
                        onClick={() => setViewImage(null)}
                        className="absolute top-2 right-10 h-10 w-10 hover:text-red-600 text-white bg-gray-300 p-2 rounded-full"
                      >
                        X
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProfilePic;
