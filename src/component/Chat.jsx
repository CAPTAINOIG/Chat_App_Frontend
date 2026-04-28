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
    <div className="background">
      <Toaster position="top-center" />
      <div className="flex flex-col md:flex-row h-screen">
        <UserList
          users={users}
          handleUserClick={handleUserClick}
          accountOwner={accountOwner}
          image={image}
        />

        <div className="flex-1 flex flex-col bg-opacity-80" id="scroll-container">
          <div className="flex-1">
            {selectedUser ? (
              <>
                <ChatHeader 
                  selectedUser={selectedUser}
                  image={image}
                  setImage={setImage}
                />

                <PinnedMessages
                  pinnedMessage={pinnedMessage}
                  setPinnedMessage={setPinnedMessage}
                  userId={userId}
                />

                <TypingIndicator
                  isTyping={isTyping}
                  typingUser={typingUser}
                  users={users}
                />

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
              </>
            ) : (
              <p className="text-surface-400 bg-surface-800/50 backdrop-blur-sm border border-surface-700 rounded-lg py-12 p-6 text-center text-lg">
                Select a user to start chatting.
              </p>
            )}
          </div>
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
    </div>
  );
};

export default Chat;