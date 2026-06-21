import { useState, useRef, useEffect } from 'react';
import { FaThumbtack, FaChevronDown, FaChevronUp, FaSearch, FaRegCheckSquare, FaClock, FaStar, FaTimes, FaLink, FaCalendar, FaUsers, FaFlag, FaBan, FaTrash } from 'react-icons/fa';
import ProfilePic from './ProfilePic';
import PinnedMessages from './PinnedMessages';
import CallButtons from './CallButtons';
import { formatTime } from './utils';
import { HiOutlineDotsVertical, HiOutlineUser } from 'react-icons/hi';
import { AiOutlineAudioMuted } from 'react-icons/ai';
import { CiSearch } from 'react-icons/ci';

  const data = [
    {
      icon: <HiOutlineUser />,
      text: "Contact Info",
      goto: 'contact info',
    },
    {
      icon: <FaSearch />,
      text: "Search",
      goto: "search",
    },
    {
      icon: <FaRegCheckSquare />,
      text: "Select Messages",
      goto: "select messages",
    },
    {
      icon: <AiOutlineAudioMuted />,
      text: "Mute Notifications",
      goto: "mute notifications",
    },
    {
      icon: <FaClock />,
      text: "Disappearing Messages",
      goto: "disappearing messages",
    },
    {
      icon: <FaStar />,
      text: "Add to Favorites",
      goto: "add to favorites",
    },
    {
      icon: <FaTimes />,
      text: "Close Chat",
      goto: "close chat",
    },
    {
      icon: <FaLink />,
      text: "Send Call link",
      goto: "send call link",
    },
    {
      icon: <FaCalendar />,
      text: "Schedule Call",
      goto: "schedule call",
    },
    {
      icon: <FaUsers />,
      text: "New Group Call",
      goto: "new group call",
    },
    {
      icon: <FaFlag />,
      text: "Report",
      goto: "report",
    },
    {
      icon: <FaBan />,
      text: "Block",
      goto: "block",
    },
    {
      icon: <FaTrash />,
      text: "Delete Chat",
      goto: "delete chat",
    },
  ];


const ChatHeader = ({ selectedUser, image, setImage, pinnedMessage, setPinnedMessage, scrollToMessage, accountOwner }) => {
  const [showPinnedDropdown, setShowPinnedDropdown] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  
  const togglePinnedDropdown = () => {
    setShowPinnedDropdown(!showPinnedDropdown);
  };

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center justify-between px-5 py-4 bg-white/95 dark:bg-surface-800/95 backdrop-blur-sm border-b border-surface-200 dark:border-surface-700 shadow-lg">
        <div className="flex items-center gap-4">
          <ProfilePic
            selectedUser={selectedUser}
            image={image}
            setImage={setImage}
            accountOwner={accountOwner}
          />
          <div>
            <p className="text-surface-900 dark:text-surface-50 font-semibold text-lg">
              Chatting with {selectedUser.username}
            </p>
            {selectedUser?.showOnline &&
              <p
                className={`ml-0 text-sm ${selectedUser.online ? "text-accent-400" : "text-surface-600 dark:text-surface-500 font-semibold text-sm"
                  }`}
              >
                {selectedUser.online ? "Online" : "last seen " + formatTime(selectedUser.lastSeen)}
              </p>
            }
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          {/* Call Buttons */}
          <CallButtons
            receiverId={selectedUser._id}
            receiverName={selectedUser.username}
            isOnline={selectedUser.online}
            accountOwner={accountOwner}
          />
          <div className="relative flex" ref={menuRef}>
            <button title='Menu'
              onClick={handleMenuToggle}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-900 dark:text-white transition-colors"
            >
              <HiOutlineDotsVertical size={20} />
            </button>
            <button title='Menu'
              onClick={handleMenuToggle}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-900 dark:text-white transition-colors"
            >
              <CiSearch size={20} />
            </button>

            {/* Menu Dropdown */}
            {showMenu && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-surface-800 shadow-xl rounded-lg border border-surface-200 dark:border-surface-700 z-50 overflow-hidden">
               {data.map((item, index) => {
                  return (
                    <button
                      key={index}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-surface-900 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                    >
                      {item.icon}
                      <span>{item.text}</span>
                    </button>
                  )
                })
               }
              </div>
            )}
          </div>

          {/* Pinned Messages Dropdown Button */}
          {pinnedMessage && pinnedMessage.length > 0 && (
            <div className="relative">
              <button
                onClick={togglePinnedDropdown}
                className="flex items-center gap-2 px-3 py-2 bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 rounded-lg transition-colors duration-200"
              >
                <FaThumbtack className="text-sm" />
                <span className="text-sm font-medium">
                  Pinned ({pinnedMessage.length})
                </span>
                {showPinnedDropdown ? (
                  <FaChevronUp className="text-xs" />
                ) : (
                  <FaChevronDown className="text-xs" />
                )}
              </button>

              {/* Dropdown Content */}
              {showPinnedDropdown && (
                <div className="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white/95 dark:bg-surface-800/95 backdrop-blur-sm border border-surface-200 dark:border-surface-700 rounded-lg shadow-xl z-50">
                  <PinnedMessages
                    pinnedMessage={pinnedMessage}
                    setPinnedMessage={setPinnedMessage}
                    scrollToMessage={scrollToMessage}
                    isDropdown={true}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;