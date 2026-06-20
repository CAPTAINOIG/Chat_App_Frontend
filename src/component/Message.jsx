import { useEffect, useRef, useState } from 'react';
import ForwardMessage from './ForwardMessage';
import { BsThreeDotsVertical } from "react-icons/bs";
import { motion } from 'framer-motion';
import user1 from "../assets/image/user1.png";
import useAuthStore from '../store/auth';

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
  isDeleting = false,
  isPinning = false,
}) => {
  const user = useAuthStore((state) => state.user)
  const menuRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(msg.duration || 0);
  const audioRef = useRef(null);


  // Handle both populated objects and string IDs
  const getSenderId = (msg) => {
    if (typeof msg.senderId === 'string') {
      return msg.senderId;
    }
    if (typeof msg.senderId === 'object' && msg.senderId) {
      const id = msg.senderId._id || msg.senderId.id;
      return id;
    }
    if (msg.sender) {
      if (typeof msg.sender === 'string') {
        return msg.sender;
      }
      if (typeof msg.sender === 'object' && msg.sender) {
        const id = msg.sender._id || msg.sender.id;
        return id;
      }
    }
    if (msg.from) {
      if (typeof msg.from === 'string') {
        return msg.from;
      }
      if (typeof msg.from === 'object' && msg.from) {
        const id = msg.from._id || msg.from.id;
        return id;
      }
    }
    return null;
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

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatAudioTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Generate waveform bars
  const waveformBars = Array.from({ length: 40 }, (_, i) => {
    const height = 10 + Math.random() * 20;
    return { id: i, height };
  });

  return (
    <div className={`flex group mb-2 px-1 sm:px-2 mt-20 ${isSender ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          relative p-2 sm:p-3 rounded-2xl max-w-[85%] sm:max-w-[70%] min-w-[120px] shadow-sm
          ${isSender
            ? 'bg-whatsapp-sent text-whatsapp-text dark:bg-surface-800/95 dark:text-surface-50'
            : 'bg-whatsapp-received text-whatsapp-text dark:bg-surface-700 dark:text-surface-50'
          }
        `}
        style={{
          borderBottomLeftRadius: isSender ? "8px" : "0",
          borderBottomRightRadius: isSender ? "0" : "8px",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
        }}
      >
        <div className="flex gap-1 sm:gap-2 items-start px-1">
          {msg.type === 'voice' ? (
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={togglePlay}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all flex-shrink-0 ${
                  isSender
                    ? 'bg-primary-600 hover:bg-primary-500 text-white dark:bg-white/20 dark:hover:bg-white/30 dark:text-white'
                    : 'bg-primary-600 hover:bg-primary-500 text-white dark:bg-white/20 dark:hover:bg-white/30 dark:text-white'
                }`}
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center gap-1 w-full">
                  {waveformBars.map((bar, index) => {
                    const progress = duration > 0 ? (currentTime / duration) : 0;
                    const isActive = index / waveformBars.length < progress;
                    return (
                      <div
                        key={bar.id}
                        className="w-1 rounded-full"
                        style={{
                          height: `${bar.height}px`,
                          backgroundColor: isActive
                            ? (isSender ? 'white' : '#6366f1')
                            : (isSender ? 'rgba(255, 255, 255, 0.4)' : 'rgba(99, 102, 241, 0.4)'),
                          animation: isPlaying ? `wave-${index % 2} 0.5s ease-in-out infinite` : 'none',
                          animationDelay: `${index * 0.03}s`,
                        }}
                      />
                    );
                  })}
                  <div> 
                    <img
                    className="w-10 h-10 rounded-full border-4 border-white dark:border-surface-900 object-cover"
                    src={user?.profilePicture || user1}
                    alt="Profile"
                  />
                  </div>
                </div>
                <div className="flex justify-between text-xs opacity-80">
                  <span>{formatAudioTime(currentTime)}</span>
                  <span>{formatAudioTime(duration)}</span>
                </div>
              </div>
              <audio
                ref={audioRef}
                src={msg.audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onLoadedMetadata={handleLoadedMetadata}
              />
            </div>
          ) : (
            <p className="flex-1 text-sm sm:text-base break-words">{msg.content}</p>
          )}
        </div>
        <div className="flex justify-between items-center mt-1">
          <em className="text-xs opacity-70">
            {msg.timestamp && new Date(msg?.timestamp).toLocaleTimeString()}
          </em>
          {isSender && (
            <div className="text-xs opacity-70 ml-2">
              {msg.status === 'sending' && '⏳'}
              {msg.status === 'sent' && '✓'}
              {msg.status === 'delivered' && '✓✓'}
              {msg.status === 'read' && <span className="text-blue-400">✓✓</span>}
              {msg.status === 'failed' && <span className="text-red-400">✗</span>}
            </div>
          )}
        </div>

        {msg.replyTo && (
          <div
            onClick={() => scrollToMessage(msg?._id)}
            className={`reply-info p-2 border-l-4 text-sm mb-2 mt-2 rounded cursor-pointer hover:opacity-80 transition-opacity ${
              isSender
                ? 'border-accent-400 bg-primary-700 dark:bg-primary-700'
                : 'border-primary-400 bg-surface-100 dark:bg-surface-800'
            }`}
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
                ? '-left-11 sm:-left-12 bg-surface-700 hover:bg-surface-600 text-surface-200 dark:bg-surface-700 dark:hover:bg-surface-600'
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
              absolute z-30 min-w-[160px] bg-white dark:bg-surface-800/95 backdrop-blur-md border border-surface-200 dark:border-surface-600/50 
              rounded-xl shadow-2xl overflow-hidden
              ${isSender
                ? 'right-0 top-full mt-2'
                : 'left-0 top-full mt-2'
              }
            `}
          >
            {data?.map((item, index) => {
              const isActionLoading =
                (item?.text === 'Delete' && isDeleting) ||
                ((item?.text === 'Pin' || item?.text === 'Unpin') && isPinning);
              return (
                <div
                  key={index}
                  className={`flex items-center space-x-3 px-4 py-3 transition-colors text-sm border-b border-surface-100 dark:border-surface-700/30 last:border-b-0 ${isActionLoading
                      ? 'cursor-not-allowed opacity-50'
                      : 'cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700/80 text-surface-900 dark:text-surface-50'
                    }`}
                  onClick={() => !isActionLoading && handleAction(item?.text, msg.content, msg?.messageId, msg?.receiverId, msg?.senderId)}
                >
                  <span className="text-surface-600 dark:text-surface-400 flex-shrink-0">
                    {isActionLoading ? (
                      <div className="w-4 h-4 border-2 border-surface-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      item?.icon
                    )}
                  </span>
                  <span className="font-medium">
                    {isActionLoading ? 'Loading...' : item?.text}
                  </span>
                </div>
              );
            })}
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
