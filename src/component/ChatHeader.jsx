import { useState } from 'react';
import { FaThumbtack, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import ProfilePic from './ProfilePic';
import PinnedMessages from './PinnedMessages';
import CallButtons from './CallButtons';
import { formatTime } from './utils';

const ChatHeader = ({ selectedUser, image, setImage, pinnedMessage, setPinnedMessage, scrollToMessage, accountOwner }) => {
  const [showPinnedDropdown, setShowPinnedDropdown] = useState(false);

  const togglePinnedDropdown = () => {
    setShowPinnedDropdown(!showPinnedDropdown);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between fixed w-full z-10 px-5 py-4 bg-surface-800/95 backdrop-blur-sm border-b border-surface-700 shadow-lg">
        <div className="flex items-center gap-4">
          <ProfilePic
            selectedUser={selectedUser}
            image={image}
            setImage={setImage}
            accountOwner={accountOwner}
          />
          <div>
            <p className="text-surface-50 font-semibold text-lg">
              Chatting with {selectedUser.username}
            </p>
            <p className="text-surface-500 font-semibold text-sm"
              // className={`ml-0 text-sm ${
              //   selectedUser.online ? "text-accent-400" : "text-red-400"
              // }`}
            >
              {/* ({selectedUser.online ? "Online" : "Offline"}) */}
             last seen {formatTime(selectedUser.lastSeen)}
            </p>
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
                <div className="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-surface-800/95 backdrop-blur-sm border border-surface-700 rounded-lg shadow-xl z-50">
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