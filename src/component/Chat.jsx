import React, { useState, useEffect, useRef } from "react";
import { FaReply, FaCopy, FaForward, FaThumbtack, FaTrashAlt } from "react-icons/fa";
import { Toaster, toast } from "sonner";
import { useAuth } from "./AuthProvider";
import useAuthStore from "../store/auth";
import { useSocket } from "../hooks/useSocket";
import { useMessages } from "../hooks/useMessages";
import { SOCKET_EVENTS } from "../constants/socketEvents";
import { getUsers } from "../api/authApi";

// Components
import UserList from "./UserList";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";
import ChatHeader from "./ChatHeader";
import PinnedMessages from "./PinnedMessages";
import TypingIndicator from "./TypingIndicator";

const Chat = () => {
  const messageRefs = useRef({});
  const { userId, username, token } = useAuth();
  const getLastChattedUserId = useAuthStore((state) => state.getLastChattedUserId);
  const setLastChattedUserId = useAuthStore((state) => state.setLastChattedUserId);

  // Socket management
  const { socket, onlineUsers, isConnected, emitEvent, onEvent, offEvent } = useSocket(userId, token);

  // Message management
  const {
    messages,
    setMessages,
    pinnedMessage,
    setPinnedMessage,
    fetchMessages,
    sendMessage,
    deleteMessage,
    pinMessage,
    unpinMessage,
    fetchPinnedMessages,
    forwardMessage: forwardMessageHook,
  } = useMessages(userId, socket);

  // UI State
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [receiverId, setReceiverId] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [openToggle, setOpenToggle] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [openForwardToggle, setOpenForwardToggle] = useState(false);
  const [selectedToggle, setSelectedToggle] = useState(false);
  const [forwardTo, setForwardTo] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [accountOwner, setAccountOwner] = useState(false);
  const [image, setImage] = useState(null);

  // Message actions data
  const messageActions = [
    { icon: <FaReply />, text: "Reply" },
    { icon: <FaCopy />, text: "Copy" },
    { icon: <FaTrashAlt />, text: "Delete" },
    { icon: <FaForward />, text: "Forward" },
    { icon: <FaThumbtack />, text: "Pin" },
    { icon: <FaThumbtack />, text: "Unpin" },
  ];

  // Initialize socket listeners
  useEffect(() => {
    if (!socket) return;

    // Get all users
    const getAllUsers = () => {
      emitEvent(SOCKET_EVENTS.GET_USERS, { token });
    };

    // Listen for users
    const handleGetUsers = (data) => {
      if (data) {
        const owner = data.users.find((user) => user._id === userId);
        setAccountOwner(owner);
        const filteredUsers = data.users.filter((user) => user._id !== userId);
        const updatedUsers = filteredUsers.map((user) => ({
          ...user,
          online: onlineUsers.includes(user._id),
        }));
        setUsers(updatedUsers);
      }
    };

    // Listen for new messages
    const handleNewMessage = (message) => {
      setMessages((prevMessages) => {
        // Prevent duplicates by checking if message already exists
        const exists = prevMessages.some(msg => msg.messageId === message.messageId);
        if (exists) {
          console.log("Duplicate message prevented:", message.messageId);
          return prevMessages;
        }
        return [...prevMessages, message];
      });
    };

    // Listen for received messages
    const handleReceiveMessage = (msg) => {
      setMessages((prevMessages) => {
        // Prevent duplicates by checking if message already exists
        const exists = prevMessages.some(message => message.messageId === msg.messageId);
        if (exists) {
          console.log("Duplicate message prevented:", msg.messageId);
          return prevMessages;
        }
        return [...prevMessages, msg];
      });
    };

    // Set up listeners
    onEvent(SOCKET_EVENTS.GET_USERS, handleGetUsers);
    onEvent(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
    onEvent(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);

    // Get users on connect
    getAllUsers();

    // Fallback: Try HTTP API if Socket.IO doesn't return users after 3 seconds
    const fallbackTimer = setTimeout(async () => {
      if (users.length === 0) {
        console.log("Socket.IO didn't return users, trying HTTP API fallback");
        try {
          const response = await getUsers();
          console.log("HTTP API users response:", response);
          
          let usersData = [];
          if (response.success && response.data && response.data.users) {
            usersData = response.data.users;
          } else if (response.users) {
            usersData = response.users;
          } else if (Array.isArray(response)) {
            usersData = response;
          }
          
          if (usersData.length > 0) {
            const owner = usersData.find((user) => (user._id || user.id) === userId);
            setAccountOwner(owner);
            
            const filteredUsers = usersData.filter((user) => (user._id || user.id) !== userId);
            const updatedUsers = filteredUsers.map((user) => ({
              ...user,
              online: onlineUsers.includes(user._id || user.id),
            }));
            setUsers(updatedUsers);
          }
        } catch (error) {
          console.error("Failed to fetch users via HTTP API:", error);
        }
      }
    }, 3000);

    // Load last chatted user
    const lastChattedUserId = getLastChattedUserId();
    if (lastChattedUserId) {
      setReceiverId(lastChattedUserId);
      fetchMessages(lastChattedUserId);
      
      // Find and set selected user
      emitEvent(SOCKET_EVENTS.GET_USERS, { token });
    }

    return () => {
      clearTimeout(fallbackTimer);
      offEvent(SOCKET_EVENTS.GET_USERS, handleGetUsers);
      offEvent(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
      offEvent(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
    };
  }, [socket, onlineUsers, userId, token]);

  // Typing indicators
  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleTypingEvent = ({ senderId, receiverId }) => {
      if (senderId === selectedUser._id && receiverId === userId) {
        setIsTyping(true);
        setTypingUser(senderId);
      }
    };

    const handleStopTypingEvent = ({ senderId, receiverId }) => {
      if (senderId === selectedUser._id && receiverId === userId) {
        setIsTyping(false);
        setTypingUser(null);
      }
    };

    onEvent(SOCKET_EVENTS.TYPING, handleTypingEvent);
    onEvent(SOCKET_EVENTS.STOP_TYPING, handleStopTypingEvent);

    return () => {
      offEvent(SOCKET_EVENTS.TYPING, handleTypingEvent);
      offEvent(SOCKET_EVENTS.STOP_TYPING, handleStopTypingEvent);
    };
  }, [socket, userId, selectedUser?._id]);

  // Handlers
  const handleUserClick = (user) => {
    setReceiverId(user._id);
    setSelectedUser(user);
    setLastChattedUserId(user._id);
    fetchMessages(user._id);
    setOpenForwardToggle(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sendMessage(message, receiverId, replyMessage)) {
      setMessage("");
      setReplyMessage("");
      setShowEmojiPicker(false);
    }
  };

  const handleToggle = (messageId) => {
    setOpenToggle(!openToggle);
    setSelectedMsg(messageId);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const scrollToMessage = (messageId) => {
    const targetElement = messageRefs.current[messageId];
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleAction = (action, messageContent, messageId, receiverId, senderId) => {
    switch (action) {
      case "Copy":
        handleCopy(messageContent);
        break;
      case "Reply":
        handleReply(messageContent);
        break;
      case "Delete":
        handleDelete(messageId);
        break;
      case "Forward":
        handleForwardMessage(messageId, users);
        break;
      case "Pin":
        handlePinnedMessage(messageId, receiverId, senderId);
        break;
      case "Unpin":
        handleUnPinnedMessage(messageId, receiverId, senderId);
        break;
    }
  };

  const handleCopy = async (messageContent) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(messageContent);
        toast.success("Message copied to clipboard!");
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = messageContent;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          toast.success("Message copied to clipboard!");
        } catch (err) {
          toast.error("Failed to copy message");
        }
        document.body.removeChild(textArea);
      }
      setOpenToggle(false);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy message");
    }
  };

  const handleReply = (replyContent) => {
    setReplyMessage(replyContent);
    setOpenToggle(false);
  };

  const handleDelete = async (messageId) => {
    if (await deleteMessage(messageId)) {
      setOpenToggle(false);
    }
  };

  const handlePinnedMessage = async (messageId, receiverId, senderId) => {
    if (await pinMessage(messageId, receiverId, senderId)) {
      setOpenToggle(false);
    }
  };

  const handleUnPinnedMessage = async (messageId, receiverId, senderId) => {
    if (await unpinMessage(messageId, receiverId, senderId)) {
      setOpenToggle(false);
    }
  };

  const handleForwardMessage = (messageId, users) => {
    setUsers(users);
    setSelectedToggle(messageId);
    setOpenForwardToggle(!openForwardToggle);
    setOpenToggle(false);
  };

  const handleForwardClick = (user) => {
    setForwardTo(user.username);
    setFilteredUsers([user]);
  };

  const handleForwardTo = (e) => {
    const inputValue = e.target.value;
    setForwardTo(inputValue);
    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const forwardMessage = (username, receiverId) => {
    if (forwardMessageHook(selectedToggle, receiverId, username)) {
      setOpenForwardToggle(false);
      setForwardTo("");
      setFilteredUsers([]);
    }
  };

  const emitTyping = () => {
    if (socket && isConnected) {
      emitEvent(SOCKET_EVENTS.TYPING, { senderId: userId, receiverId });
    }
  };

  const emitStopTyping = () => {
    if (socket && isConnected) {
      emitEvent(SOCKET_EVENTS.STOP_TYPING, { senderId: userId, receiverId });
    }
  };

  return (
    <div className="background min-h-screen">
      <Toaster position="top-center" />
      <div className="flex h-screen">
        {/* User List - Responsive Sidebar */}
        <div className={`
          ${selectedUser ? 'hidden lg:flex' : 'flex'} 
          flex-col
          w-full sm:w-80 lg:w-1/4 xl:w-1/5
          border-r border-surface-700
          ${selectedUser ? 'lg:min-w-[300px]' : ''}
        `}>
          <UserList
            users={users}
            handleUserClick={handleUserClick}
            accountOwner={accountOwner}
            image={image}
          />
        </div>

        {/* Chat Area - Responsive Main Content */}
        <div className={`
          ${selectedUser ? 'flex' : 'hidden lg:flex'} 
          flex-col flex-1 
          bg-surface-900/30 backdrop-blur-sm
          relative overflow-hidden
        `}>
          {selectedUser ? (
            <>
              {/* Mobile Back Button */}
              <button
                onClick={() => setSelectedUser(null)}
                className="lg:hidden absolute top-4 left-4 z-20 bg-surface-800/90 hover:bg-surface-700 text-surface-200 p-2 rounded-full transition-colors shadow-lg backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Chat Header */}
              <div className="flex-shrink-0 z-10">
                <ChatHeader 
                  selectedUser={selectedUser}
                  image={image}
                  setImage={setImage}
                />
              </div>

              {/* Pinned Messages */}
              <div className="flex-shrink-0">
                <PinnedMessages
                  pinnedMessage={pinnedMessage}
                  setPinnedMessage={setPinnedMessage}
                  userId={userId}
                />
              </div>

              {/* Typing Indicator */}
              <div className="flex-shrink-0">
                <TypingIndicator
                  isTyping={isTyping}
                  typingUser={typingUser}
                  users={users}
                />
              </div>

              {/* Messages Container */}
              <div className="flex-1 relative overflow-hidden">
                <div className="absolute inset-0 px-3 sm:px-4 lg:px-6 py-4 overflow-y-auto">
                  <MessageList
                    messages={messages}
                    userId={userId}
                    selectedUser={selectedUser}
                    messageRefs={messageRefs}
                    openToggle={openToggle}
                    setOpenToggle={setOpenToggle}
                    selectedMsg={selectedMsg}
                    handleToggle={handleToggle}
                    data={messageActions}
                    handleAction={handleAction}
                    openForwardToggle={openForwardToggle}
                    selectedToggle={selectedToggle}
                    forwardTo={forwardTo}
                    handleForwardTo={handleForwardTo}
                    handleForwardClick={handleForwardClick}
                    forwardMessage={forwardMessage}
                    setOpenForwardToggle={setOpenForwardToggle}
                    users={users}
                    scrollToMessage={scrollToMessage}
                    filteredUsers={filteredUsers}
                    setFilteredUsers={setFilteredUsers}
                    setForwardTo={setForwardTo}
                  />
                </div>
              </div>

              {/* Chat Input */}
              <div className="flex-shrink-0 bg-surface-900/95 backdrop-blur-sm border-t border-surface-700">
                <div className="p-3 sm:p-4">
                  <ChatInput
                    handleSubmit={handleSubmit}
                    toggleEmojiPicker={toggleEmojiPicker}
                    showEmojiPicker={showEmojiPicker}
                    handleEmojiClick={handleEmojiClick}
                    message={message}
                    setMessage={setMessage}
                    emitTyping={emitTyping}
                    emitStopTyping={emitStopTyping}
                    replyMessage={replyMessage}
                    setReplyMessage={setReplyMessage}
                  />
                </div>
              </div>
            </>
          ) : (
            /* No Chat Selected State */
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 mx-auto mb-4 bg-surface-700 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-surface-50 mb-2">
                  Welcome to Chat
                </h3>
                <p className="text-surface-400 text-sm sm:text-base">
                  Select a conversation from the sidebar to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;