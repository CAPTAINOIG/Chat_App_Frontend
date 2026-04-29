import { useEffect, useRef } from 'react';
import ForwardMessage from './ForwardMessage';
import { BsThreeDotsVertical } from "react-icons/bs";
import { motion } from 'framer-motion';

const Message = ({
    msg,
    userId,
    selectedUser,
    openToggle,
    selectedMsg,
    handleToggle,
    data,
    handleAction,
    openForwardToggle,
    selectedToggle,
    forwardTo,
    handleForwardTo,
    forwardMessage,
    setOpenForwardToggle,
    scrollToMessage,
    handleForwardClick,
    filteredUsers,
    setFilteredUsers,
    setForwardTo, 
    users,
}) => {
  const menuRef = useRef(null);

  // Handle both populated objects and string IDs
  const getSenderId = (msg) => {
    if (typeof msg.senderId === 'string') {
      return msg.senderId;
    }
    if (typeof msg.senderId === 'object' && msg.senderId) {
      return msg.senderId._id || msg.senderId.id;
    }
    return msg.sender || msg.from || null;
  };

  const messageSenderId = getSenderId(msg);
  const isSender = String(messageSenderId) === String(userId);

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        // Only close if this message's menu is open
        if (openToggle && selectedMsg === msg?.messageId) {
          handleToggle(null); // Close the menu
        }
      }
    };

    if (openToggle && selectedMsg === msg?.messageId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openToggle, selectedMsg, msg?.messageId, handleToggle]);
  
  return (
    <div className={`flex group mb-2 px-1 sm:px-2 mt-20 ${isSender ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`
          relative p-2 sm:p-3 rounded-2xl max-w-[85%] sm:max-w-[70%] min-w-[120px] shadow-md
          ${isSender 
            ? 'bg-primary-600 text-white' 
            : 'bg-surface-700 text-surface-50'
          }
        `}
        style={{
          borderBottomLeftRadius: isSender ? "20px" : "5px",
          borderBottomRightRadius: isSender ? "5px" : "20px",
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
        }}
      >
        <div className="flex gap-1 sm:gap-2 items-start px-1">
          <strong className="text-xs sm:text-sm flex-shrink-0">
            {isSender ? 'You' : (
              (typeof msg.senderId === 'object' && msg.senderId?.username) ||
              selectedUser?.username || 
              'Unknown'
            )}:
          </strong>
          <p className="flex-1 text-sm sm:text-base break-words">{msg.content}</p>
        </div>
        <em className="text-xs opacity-70 block mt-1 text-right">
          {msg.timestamp && new Date(msg?.timestamp).toLocaleTimeString()}
        </em>

        {msg.replyTo && (
          <div
            onClick={() => scrollToMessage(msg?._id)}
            className={`reply-info p-2 border-l-4 ${
              isSender ? 'border-accent-400 bg-primary-700' : 'border-primary-400 bg-surface-800'
            } text-sm mb-2 mt-2 rounded cursor-pointer hover:opacity-80 transition-opacity`}
          >
            <span className="opacity-70">Replying to:</span> <span className="font-semibold">{msg?.replyTo}</span>
          </div>
        )}

        {!openForwardToggle && (
          <button
            onClick={() => handleToggle(msg?.messageId)}
            className={`
              absolute top-1 p-2 rounded-full cursor-pointer transition-all duration-200 z-10
              sm:opacity-0 sm:group-hover:opacity-100 opacity-70 hover:opacity-100 hover:scale-110
              ${isSender
                ? '-left-11 sm:-left-12 bg-surface-700 hover:bg-surface-600 text-surface-200'
                : '-right-11 sm:-right-12 bg-primary-600 hover:bg-primary-500 text-white'
              }
              shadow-lg
            `}
          >
            <BsThreeDotsVertical className="text-sm" />
          </button>
        )}

        {openToggle && selectedMsg === msg?.messageId && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`
              absolute z-30 min-w-[160px] bg-surface-800/95 backdrop-blur-md border border-surface-600/50 
              rounded-xl shadow-2xl overflow-hidden
              ${isSender 
                ? 'right-0 top-full mt-2' 
                : 'left-0 top-full mt-2'
              }
            `}
          >
            {data?.map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 px-4 py-3 cursor-pointer hover:bg-surface-700/80 transition-colors text-surface-50 text-sm border-b border-surface-700/30 last:border-b-0"
                onClick={() => handleAction(item?.text, msg.content, msg?.messageId, msg?.receiverId, msg?.senderId)}
              >
                <span className="text-surface-400 flex-shrink-0">{item?.icon}</span>
                <span className="font-medium">{item?.text}</span>
              </div>
            ))}
          </motion.div>
        )}

        {openForwardToggle && selectedToggle === msg?.messageId && (
          <ForwardMessage
            users={users}
            forwardTo={forwardTo}
            handleForwardTo={handleForwardTo}
            forwardMessage={forwardMessage}
            setOpenForwardToggle={setOpenForwardToggle}
            selectedToggle={selectedToggle}
            handleForwardClick={handleForwardClick}
            filteredUsers={filteredUsers}
            setFilteredUsers={setFilteredUsers}
            setForwardTo={setForwardTo}
            data={data}
          />
        )}
      </div>
    </div>
  );
};

export default Message;
