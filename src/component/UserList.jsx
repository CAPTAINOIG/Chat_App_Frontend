import { useEffect, useRef, useState } from "react";
import user from "../assets/image/user.png";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit, faEye } from "@fortawesome/free-solid-svg-icons";
import { FiMonitor } from "react-icons/fi";
import { MdOutlineAccountCircle } from "react-icons/md";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { CiEdit, CiSettings, CiVideoOn } from "react-icons/ci";
import {
  IoIosHelpCircleOutline,
  IoMdInformationCircleOutline,
  IoMdNotificationsOutline,
} from "react-icons/io";
import { AiOutlineEdit } from "react-icons/ai";
import { GrStorage } from "react-icons/gr";
import { TbTableShortcut } from "react-icons/tb";
import { toast } from "sonner";
import { useAuth } from "./AuthProvider";
import { 
  uploadProfilePicture, 
  fetchProfilePicture, 
  updateProfile, 
  getProfileData,
  handleApiError,
  validateImageFile,
  fileToBase64
} from "../api/authApi";

const UserList = ({ users, handleUserClick, accountOwner, isLoading = false }) => {
  const { userId, logout } = useAuth();
  const [image, setImage] = useState(null);
  const [openToggle, setOpenToggle] = useState(false);
  const [editToggle, setEditToggle] = useState(false);
  const dropdownRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [viewImage, setViewImage] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState(null);

  let navigate = useNavigate();

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
        setOpenToggle(false);
        setEditToggle(false);
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Validate file
      validateImageFile(file);
      
      setLoading(true);
      setEditToggle(false);

      // Convert to base64
      const base64 = await fileToBase64(file);
      
      // Upload to server
      const response = await uploadProfilePicture(userId, base64);
      
      if (response && response.success !== false) {
        toast.success("Profile picture updated successfully!");
        await fetchProfilePic();
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      toast.error(handleApiError(error, "Failed to upload image"));
      setLoading(false);
    }
  };

  const fetchProfilePic = async () => {
    setLoading(true);
    try {
      const response = await fetchProfilePicture(userId);
      if (response?.data?.url) {
        setImage(response.data.url);
        setLoading(false);
        setEditToggle(false);
      } else {
        setImage(null);
        setLoading(false);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error(handleApiError(error, "Failed to load profile picture"));
      }
      setImage(null);
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    toast.info("Profile picture removed.");
  };

  const handleEdit = () => {
    setEditToggle(!editToggle);
  };

  const handleViewImage = () => {
    setViewImage(image);
  };

  const handleLogOut = () => {
    logout();
    navigate("/signin");
  };

  const handleUpdate = async () => {
    const data = { profileName, aboutMe };
    try {
      await updateProfile(userId, data);
      await getProfileUpdate();
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(handleApiError(error, "Failed to update profile"));
    }
  };

  const getProfileUpdate = async () => {
    try {
      const response = await getProfileData(userId);
      setProfileName(response?.userDetail?.profileName || "");
      setAboutMe(response?.userDetail?.aboutMe || "");
    } catch (error) {
      console.error("Failed to get profile data:", error);
    }
  };

  useEffect(() => {
    fetchProfilePic();
    getProfileUpdate();
  }, []);

  return (
    <div className="h-full flex flex-col p-3 sm:p-4 overflow-y-auto">
      <h2 className="text-lg sm:text-xl font-bold mb-4 text-surface-50 bg-surface-900 border border-surface-700 rounded-lg p-3">
        Conversations
      </h2>
      <div className="space-y-2 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-surface-400 text-sm">Loading users...</p>
            </div>
          </div>
        ) : users.length > 0 ? (
          users.map((item, i) => {
            return (
              <div
                key={i}
                className="p-3 cursor-pointer hover:bg-primary-600 hover:text-white text-surface-200 rounded-lg bg-surface-900 border border-surface-700 transition-all"
                onClick={() => handleUserClick(item)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    {item?.profilePicture ? (
                      <img
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-primary-500 object-cover"
                        src={item.profilePicture}
                        alt="Profile"
                      />
                    ) : (
                      <img
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-surface-600 object-cover"
                        src={user}
                        alt="Profile"
                      />
                    )}
                    {item.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-accent-400 border-2 border-surface-900 rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm sm:text-base truncate block">
                      {item?.username || "Unknown User"}
                    </span>
                    {item.online && (
                      <span className="text-xs text-accent-400">Online</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-center text-surface-500 text-sm">No users available</p>
          </div>
        )}
      </div>

      {/* Profile Button - Fixed at bottom */}
      <div className="mt-4 pt-4 border-t border-surface-700">
        <div
          onClick={handleAction}
          className="flex items-center gap-3 p-3 rounded-lg border-2 border-primary-500 cursor-pointer hover:border-primary-400 transition-colors bg-surface-900/50"
        >
          <div className="relative flex-shrink-0">
            {loading ? (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-primary-500 bg-surface-700 animate-pulse"></div>
            ) : image ? (
              <img
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                src={image}
                alt="Profile"
              />
            ) : (
              <img
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                src={user}
                alt="Profile"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-medium text-surface-50 text-sm sm:text-base truncate block">
              {accountOwner?.username || "Your Profile"}
            </span>
            <span className="text-xs text-surface-400">Tap to edit profile</span>
          </div>
        </div>
      </div>

      {openToggle && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="fixed top-20 left-4 right-4 md:left-4 md:right-auto md:w-[600px] z-50 bg-surface-800 shadow-2xl rounded-2xl border border-surface-700 max-h-[80vh] overflow-y-auto"
          ref={dropdownRef}
        >
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-0">
            {/* Left sidebar menu */}
            <div className="bg-surface-900 rounded-l-2xl p-3 border-r border-surface-700">
              {data?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-primary-600 rounded-lg transition-colors text-surface-200 mb-1"
                  onClick={() => handleAction(item?.text, item?.icon)}
                >
                  <span className="text-lg">{item?.icon}</span>
                  <span className="text-sm font-medium">{item?.text}</span>
                </div>
              ))}
            </div>
            
            {/* Right profile section */}
            <div className="p-6 relative group">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  {image ? (
                    <img
                      className="w-32 h-32 rounded-full object-cover border-4 border-primary-500 shadow-lg"
                      src={image}
                      alt="Profile"
                    />
                  ) : (
                    <img
                      className="w-32 h-32 rounded-full object-cover border-4 border-surface-600 shadow-lg"
                      src={user}
                      alt="Profile"
                    />
                  )}
                  <button
                    onClick={handleEdit}
                    className="absolute bottom-0 right-0 bg-primary-600 rounded-full p-2 cursor-pointer hover:bg-primary-500 transition-colors shadow-lg z-10"
                  >
                    <CiEdit
                      className="text-white"
                      size={20}
                    />
                  </button>
                </div>
              </div>

              {/* Profile Name */}
              <div className="mb-4">
                <label className="text-surface-400 text-xs font-semibold uppercase tracking-wide mb-2 block">
                  Display Name
                </label>
                <AnimatePresence mode="wait">
                  {isEditing && editingField === "profileName" ? (
                    <motion.input
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      required
                      className="w-full border border-surface-600 bg-surface-900 text-surface-50 text-base py-2 px-3 rounded-lg focus:border-primary-500 transition-colors"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      onBlur={handleUpdate}
                      onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                      autoFocus
                    />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => {
                        setIsEditing(true);
                        setEditingField("profileName");
                      }}
                      className="flex items-center justify-between border border-transparent hover:border-surface-600 py-2 px-3 rounded-lg cursor-pointer group"
                    >
                      <p className="text-surface-50 font-medium">
                        {profileName || "Enter your name"}
                      </p>
                      <AiOutlineEdit className="text-surface-500 group-hover:text-primary-400 transition-colors" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* About Section */}
              <div className="mb-4">
                <label className="text-surface-400 text-xs font-semibold uppercase tracking-wide mb-2 block">
                  About
                </label>
                <AnimatePresence mode="wait">
                  {isEditing && editingField === "aboutMe" ? (
                    <motion.textarea
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-24 rounded-lg p-3 border border-surface-600 bg-surface-900 text-surface-50 focus:border-primary-500 transition-colors resize-none"
                      placeholder="Write something about yourself..."
                      value={aboutMe}
                      onChange={(e) => setAboutMe(e.target.value)}
                      onBlur={handleUpdate}
                      autoFocus
                    />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => {
                        setIsEditing(true);
                        setEditingField("aboutMe");
                      }}
                      className="border border-transparent hover:border-surface-600 py-2 px-3 rounded-lg cursor-pointer min-h-[60px]"
                    >
                      <p className="text-surface-300 text-sm">
                        {aboutMe || "Write something about yourself..."}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Phone Number */}
              {accountOwner?.number && (
                <div className="mb-6">
                  <label className="text-surface-400 text-xs font-semibold uppercase tracking-wide mb-2 block">
                    Phone Number
                  </label>
                  <p className="text-surface-50 font-medium py-2 px-3">
                    {accountOwner.number}
                  </p>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-surface-700 my-4"></div>

              {/* Logout Button */}
              <button
                onClick={handleLogOut}
                className="w-full text-white bg-red-600 hover:bg-red-500 focus:ring-4 focus:outline-none focus:ring-red-800 font-semibold rounded-lg text-sm px-5 py-3 text-center transition-colors shadow-md"
              >
                Log Out
              </button>
              {/* Edit Profile Picture Menu */}
              {editToggle && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute top-48 left-1/2 transform -translate-x-1/2 bg-surface-800 border border-surface-600 rounded-xl shadow-2xl w-56 overflow-hidden z-[60]"
                  ref={dropdownRef}
                >
                  <button
                    onClick={() => document.getElementById("avatarInput").click()}
                    className="flex items-center gap-3 text-accent-400 hover:bg-surface-700 hover:text-white w-full py-3 px-4 cursor-pointer transition-colors text-sm font-medium"
                  >
                    <FontAwesomeIcon icon={faEdit} className="text-base" />
                    <span>Change Image</span>
                  </button>
                  <input
                    type="file"
                    id="avatarInput"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="flex items-center gap-3 text-orange-400 hover:text-white hover:bg-surface-700 w-full py-3 px-4 cursor-pointer transition-colors text-sm font-medium border-t border-surface-700"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-base" />
                    <span>Remove Image</span>
                  </button>
                  <button
                    onClick={handleViewImage}
                    className="flex items-center gap-3 text-primary-400 hover:text-white hover:bg-surface-700 w-full py-3 px-4 cursor-pointer transition-colors text-sm font-medium border-t border-surface-700"
                  >
                    <FontAwesomeIcon icon={faEye} className="text-base" />
                    <span>View Image</span>
                  </button>
                </motion.div>
              )}

              {/* Full Image Viewer */}
              {viewImage && (
                <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100]">
                  <div className="relative max-w-4xl max-h-[90vh] p-4">
                    <img
                      className="w-full h-full object-contain rounded-xl"
                      src={viewImage}
                      alt="Full-size Profile"
                    />
                    <button
                      onClick={() => setViewImage(null)}
                      className="absolute -top-2 -right-2 h-12 w-12 hover:text-red-400 text-white bg-surface-800 hover:bg-surface-700 rounded-full transition-colors shadow-xl flex items-center justify-center text-xl font-bold"
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

export default UserList;
