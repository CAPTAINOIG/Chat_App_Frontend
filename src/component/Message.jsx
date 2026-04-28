import React from 'react'
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
  
  return (
    <div className={`flex group mb-2 px-2 ${isSender ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`p-3 rounded-2xl relative max-w-[70%] min-w-[120px] shadow-md ${
          isSender 
            ? 'bg-primary-600 text-white' 
            : 'bg-surface-700 text-surface-50'
        }`}
        style={{
          borderBottomLeftRadius: isSender ? "20px" : "5px",
          borderBottomRightRadius: isSender ? "5px" : "20px",
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
        }}
      >
        <div className="flex gap-2 items-start px-1">
          <strong className="text-sm">
            {isSender ? 'You' : (
              // Handle populated sender object or fallback to selectedUser
              (typeof msg.senderId === 'object' && msg.senderId?.username) ||
              selectedUser?.username || 
              'Unknown'
            )}:
          </strong>
          <p className="flex-1">{msg.content}</p>
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
          <div onClick={() => handleToggle(msg?.messageId)} className="group cursor-pointer">
            <span
              className={`${
                isSender
                  ? 'absolute top-[5%] left-[-14%] p-2 bg-surface-700 rounded-full cursor-pointer hover:bg-surface-600 hidden group-hover:flex'
                  : 'absolute top-[10%] right-[-14%] p-2 bg-primary-600 rounded-full cursor-pointer hover:bg-primary-500 hidden group-hover:flex'
              } transition-colors`}
            >
              <BsThreeDotsVertical className="text-xl text-surface-50" />
            </span>
          </div>
        )}

        {openToggle && selectedMsg === msg?.messageId && (
          <motion.div
            id='message-container'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`${
              isSender
                ? 'absolute top-[0%] left-[-64%] w-1/2 p-2 z-10 bg-surface-800 border border-surface-600'
                : 'absolute top-[0%] right-[-64%] w-1/2 p-2 z-10 bg-primary-700 border border-primary-500'
            } rounded-lg shadow-lg`}
          >
            {data?.map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-surface-700 rounded-lg transition-colors text-surface-50"
                onClick={() => handleAction(item?.text, msg.content, msg?.messageId, msg?.receiverId, msg?.senderId)}
              >
                {item?.icon}
                <span>{item?.text}</span>
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
