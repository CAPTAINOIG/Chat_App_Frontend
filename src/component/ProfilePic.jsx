import user from "../assets/image/user.png";
import { useEffect, useRef, useState } from "react";
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
import { Drawer } from "antd";
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
import Profile from "./Userprofile/Profile";
import General from "./Userprofile/General";
import Info from "./Userprofile/Info";
import Settings from "./Userprofile/Settings";
import Accounts from "./Userprofile/Accounts";
import Storage from "./Userprofile/Storage";
import Help from "./Userprofile/Help";
import Shortcuts from "./Userprofile/Shortcuts";
import Chats from "./Userprofile/Chats";
import Notifications from "./Userprofile/Notifications";
import VideoAudio from "./Userprofile/VideoAudio";

const ProfilePic = ({ selectedUser, setImage, image, accountOwner }) => {
  const [openToggle, setOpenToggle] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewImage, setViewImage] = useState(false);
  const [profile, setProfile] = useState('home')

  const dropdownRef = useRef(null);

  const data = [
    // {
    //   icon: <FiMonitor />,
    //   text: "General",
    // },
    // {
    //   icon: <MdOutlineAccountCircle />,
    //   text: "Account",
    // },
    // {
    //   icon: <IoChatbubbleEllipsesOutline />,
    //   text: "Chats",
    // },
    // {
    //   icon: <CiVideoOn />,
    //   text: "Video & Audio",
    // },
    // {
    //   icon: <IoMdNotificationsOutline />,
    //   text: "Notifications",
    // },
    // {
    //   icon: <GrStorage />,
    //   text: "Storage",
    // },
    // {
    //   icon: <IoMdInformationCircleOutline />,
    //   text: "Info",
    // },
    // {
    //   icon: <TbTableShortcut />,
    //   text: "Shortcuts",
    // },
    // {
    //   icon: <CiSettings />,
    //   text: "Settings",
    // },
    // {
    //   icon: <IoIosHelpCircleOutline />,
    //   text: "Help",
    // },
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

  const handleAction = (selectedUser) => {
    if (accountOwner && selectedUser?._id === accountOwner._id) {
      setOpenToggle(!openToggle);
    } else {
      setDrawerOpen(!drawerOpen);
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
          <div className="w-14 h-14 rounded-full border-4 border-white dark:border-surface-900 bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
        ) : (
          <img
            className="w-14 h-14 rounded-full border-4 border-white dark:border-surface-900 object-cover"
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
          className="absolute top-16 left-0 z-50 w-48 bg-white dark:bg-surface-800 shadow-xl rounded-lg border border-surface-200 dark:border-surface-700"
        >
          <button
            onClick={() => document.getElementById("avatarInput").click()}
            className="flex items-center w-full px-4 py-3 text-surface-900 dark:text-surface-200 hover:bg-primary-600 rounded-t-lg transition-colors"
          >
            <FontAwesomeIcon icon={faEdit} className="mr-2" /> Change Image
          </button>

          <button
            onClick={handleRemoveImage}
            className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-b-lg transition-colors"
          >
            <FontAwesomeIcon icon={faTrash} className="mr-2" /> Remove Image
          </button>
        </motion.div>
      )}

      <Drawer
        title={(selectedUser?.username).toUpperCase()}
        placement="left"
        onClose={() => { setDrawerOpen(false); setProfile('home'); }}
        open={drawerOpen}
        width={400}
        styles={{
          body: { padding: 0, backgroundColor: '#fff' },
          header: { backgroundColor: '#fff', color: '#1f2937', borderBottom: '1px solid #e5e7eb' }
        }}
        rootClassName="dark:[&_.ant-drawer-body]:bg-surface-800 dark:[&_.ant-drawer-header]:bg-surface-800 dark:[&_.ant-drawer-title]:text-white dark:[&_.ant-drawer-header]:border-surface-700"
      >
        {profile === 'home' && (<Profile data={data} profile={profile} setProfile={setProfile} viewImage={viewImage} setViewImage={setViewImage} image={image} user={user} selectedUser={selectedUser} onBack={() => setProfile("home")} />)}
      </Drawer>
    </div>
  );
};

export default ProfilePic;
