import user from "../assets/image/user.png";
import { useEffect, useRef, useState } from "react";
import user1 from "../assets/image/user1.png";
import { motion } from "framer-motion";
import { FiMonitor } from "react-icons/fi";
import { MdOutlineAccountCircle } from "react-icons/md";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { useAuth } from "./AuthProvider";
import { CiSettings, CiVideoOn } from "react-icons/ci";
import {
  IoIosHelpCircleOutline,
  IoMdInformationCircleOutline,
  IoMdNotificationsOutline,
} from "react-icons/io";
import { GrStorage } from "react-icons/gr";
import { TbTableShortcut } from "react-icons/tb";
import { Toaster, toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { 
  uploadProfilePicture, 
  fetchProfilePicture,
  handleApiError,
  validateImageFile,
  fileToBase64
} from "../api/authApi";

const ProfilePic = ({ selectedUser, setImage, image, accountOwner }) => {
  const { userId } = useAuth();
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
    // Check if the selected user is the account owner by comparing IDs
    if (accountOwner && selectedUser?._id === accountOwner._id) {
      setOpenToggle(!openToggle);
    } else {
      setotherUsersToggle(!otherUsersToggle);
    }
  };

  useEffect(() => {
    fetchProfilePic();
  }, [selectedUser]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      validateImageFile(file);
      setLoading(true);
      setOpenToggle(false);
      const base64 = await fileToBase64(file);
      const response = await uploadProfilePicture(selectedUser, base64);
      if (response && response.success !== false) {
        toast.success("Profile picture updated successfully!");
        await fetchProfilePic();
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      toast.error(handleApiError(error, "Failed to upload image"));
    } finally {
      setLoading(false);
    }
  };

  const fetchProfilePic = async () => {
    setLoading(true);
    try {
      const response = await fetchProfilePicture(selectedUser);
      if (response?.data?.url) {
        setImage(response.data?.url);
        setOpenToggle(false);
      }
    } catch (error) {
      toast.error(handleApiError(error, "Failed to fetch profile picture"));
    } finally {
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
          className="absolute top-16 left-0 z-50 w-48 bg-surface-800 shadow-xl rounded-lg border border-surface-700"
        >
          <button
            onClick={() => document.getElementById("avatarInput").click()}
            className="flex items-center w-full px-4 py-3 text-surface-200 hover:bg-primary-600 rounded-t-lg transition-colors"
          >
            <FontAwesomeIcon icon={faEdit} className="mr-2" /> Change Image
          </button>

          <button
            onClick={handleRemoveImage}
            className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-surface-700 rounded-b-lg transition-colors"
          >
            <FontAwesomeIcon icon={faTrash} className="mr-2" /> Remove Image
          </button>
        </motion.div>
      )}

      {otherUsersToggle && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="absolute top-16 left-0 z-50 w-96 max-h-[80vh] overflow-y-auto bg-surface-800 shadow-2xl rounded-xl border border-surface-700"
        >
          <div className="grid grid-cols-2 gap-4 p-4">
            <div className="bg-surface-900 rounded-lg p-3">
              {data?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-primary-600 rounded-lg transition-colors text-surface-200 mb-2"
                >
                  {item?.icon}
                  <span className="text-sm font-medium">{item?.text}</span>
                </div>
              ))}
            </div>
            <div className="p-3 relative">
              <div onClick={handleViewImage} className="cursor-pointer">
                {image ? (
                  <div>
                    <img
                      className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-surface-700"
                      src={image}
                      alt="Profile"
                    />
                  </div>
                ) : (
                  <div>
                    <img
                      className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-surface-700"
                      src={user}
                      alt="Profile"
                    />
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="font-semibold text-xl text-center text-surface-50">
                  {selectedUser?.username}
                </p>
                <p className="text-gray-500 text-xs uppercase mt-2">About</p>
                <p className="text-surface-300 text-sm mt-1">
                  {selectedUser?.about || "Astral Tech Academy|| Full stack web developer|| Sport Analyst|| Captain OIG"}
                </p>
                <p className="text-gray-500 text-xs uppercase mt-3">Phone number</p>
                <p className="text-surface-300 text-sm mt-1">{selectedUser?.number || "Not provided"}</p>
                <div className="border-t border-surface-700 mt-4"></div>
              </div>

              {viewImage && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100]">
                  <div className="rounded-lg max-w-4xl max-h-[90vh] p-4 relative">
                    <img
                      className="w-full h-full object-contain rounded-lg"
                      src={viewImage}
                      alt="Full-size Profile"
                    />
                    <button
                      onClick={() => setViewImage(null)}
                      className="absolute top-4 right-4 h-12 w-12 hover:text-red-400 text-white bg-surface-800 hover:bg-surface-700 p-2 rounded-full transition-colors flex items-center justify-center text-xl font-bold"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfilePic;
