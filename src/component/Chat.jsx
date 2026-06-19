import { useState, useEffect, useRef } from "react";
import { FaReply, FaCopy, FaForward, FaThumbtack, FaTrashAlt } from "react-icons/fa";
import { Toaster, toast } from "sonner";
import { useAuth } from "./AuthProvider";
import useAuthStore from "../store/auth";
import useChatStore from "../store/chat";
import { useMessages } from "../hooks/useMessages";
import { SOCKET_EVENTS } from "../constants/socketEvents";
import { getUsers } from "../api/authApi";
import socketService from "../services/socket.service";
import callService from "../services/call.service";
import UserList from "./UserList";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";
import ChatHeader from "./ChatHeader";
import TypingIndicator from "./TypingIndicator";
import CallComponent from "./CallComponent";
import { useUserStore } from "../store/user";

const Chat = () => {
  const messageRefs = useRef({});
  const { userId, token, user } = useAuth();
  const { messagesByUser, addMessage, updateMessage, deleteMessage: deleteMessageFromStore, incrementUnread, resetUnread } = useChatStore();
  const getLastChattedUserId = useAuthStore((state) => state.getLastChattedUserId);
  const setLastChattedUserId = useAuthStore((state) => state.setLastChattedUserId);
  const setSelectedUser = useUserStore((state)=> state.setSelectedUser);
  const selectedUser = useUserStore((state)=> state.selectedUser);

  // Socket management
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user) {
      setAccountOwner(user);
    }
  }, [user]);

  // Message management
  const {
    pinnedMessage,
    setPinnedMessage,
    fetchMessages,
    sendMessage,
    sendVoiceMessage,
    deleteMessage,
    pinMessage,
    unpinMessage,
    forwardMessage: forwardMessageHook,
    // Loading states
    isLoading,
    isSending,
    isDeleting,
    isPinning,
  } = useMessages(userId, socketService);
  
  // Get messages for current receiver
  
  // UI State
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [receiverId, setReceiverId] = useState("");
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
  const [accountOwner, setAccountOwner] = useState(user);
  const [image, setImage] = useState(null);
  
  // check all the user messages and give me the one where id is the receiverId
  const messages = messagesByUser[receiverId] || [];
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);

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
    if (!userId || !token) return;
    // Connect socket first
    setIsConnecting(true);
    const socketInstance = socketService.connect(userId, token);
    setSocket(socketInstance);
    setIsConnected(socketService.isConnected());
    
    // Wait a bit for socket to stabilize, then initialize call service listeners
    const initCallListenersTimer = setTimeout(() => {
      callService.ensureSocketListenersInitialized();
    }, 500);

    // Listen for online users updates - ALL POSSIBLE EVENT NAMES!
    const handleOnlineUsersUpdate = (onlineUsersIds) => {
      let processedOnlineUsers = [];
      // Handle different possible data structures
      if (Array.isArray(onlineUsersIds)) {
        processedOnlineUsers = onlineUsersIds.map(id => String(id));
      } else if (onlineUsersIds && Array.isArray(onlineUsersIds.users)) {
        processedOnlineUsers = onlineUsersIds.users.map(id => String(id));
      } else if (onlineUsersIds && Array.isArray(onlineUsersIds.onlineUsers)) {
        processedOnlineUsers = onlineUsersIds.onlineUsers.map(id => String(id));
      }
      setOnlineUsers(processedOnlineUsers);
    };

    // Get all users
    const getAllUsers = () => {
      socketService.emit(SOCKET_EVENTS.GET_USERS, { token });
    };

    // Listen for users
    const handleGetUsers = (data) => {
      if (data) {
        const onlineUsersFromData = data.users
          .filter(user => user.online)
          .map(user => String(user._id || user.id));
        if (onlineUsersFromData.length > 0) {
          setOnlineUsers(onlineUsersFromData);
        }
        const owner = data.users.find((user) => String(user._id || user.id) === String(userId));
        if (owner) {
          setAccountOwner(owner);
        }
        const filteredUsers = data.users.filter((user) => String(user._id || user.id) !== String(userId));
        const updatedUsers = filteredUsers.map((user) => ({
          ...user,
          online: user.online || onlineUsers.includes(user._id || user.id),
        }));
        setUsers(updatedUsers);
        setIsLoadingUsers(false);
      }
    };

    // Listen for message deletions
    const handleMessageDeleted = ({ messageId }) => {
      // Find which user this message was with
      for (const [otherUserId, msgs] of Object.entries(messagesByUser)) {
        if (msgs.some(msg => msg.messageId === messageId)) {
          deleteMessageFromStore(otherUserId, messageId);
        }
      }
    };

    // Set up ALL listeners
    // Listen to every possible event name for online users
    socketService.on(SOCKET_EVENTS.UPDATE_ONLINE_USERS, handleOnlineUsersUpdate);
    socketService.on('onlineUsers', handleOnlineUsersUpdate);
    socketService.on('updateOnlineUsers', handleOnlineUsersUpdate);
    socketService.on('online-users', handleOnlineUsersUpdate);
    socketService.on('getUsersResponse', handleOnlineUsersUpdate);

    socketService.on(SOCKET_EVENTS.GET_USERS, handleGetUsers);
    
    // Listen for message deletions (backend uses 'messageDeleted')
    socketService.on('messageDeleted', handleMessageDeleted);
    
    socketService.on('userOnline', (data) => {
    });
    
    socketService.on('userOffline', (data) => {
    });

    // Set connecting to false after a short delay
    setTimeout(() => {
      setIsConnecting(false);
    }, 1000);

    // Get users on connect
    getAllUsers();
    // Fallback: Try HTTP API if Socket.IO doesn't return users after 3 seconds
    const fallbackTimer = setTimeout(async () => {
      if (users.length === 0) {
        try {
          const response = await getUsers();
          let usersData = [];
          if (response.success && response.data && response.data.users) {
            usersData = response.data.users;
          } else if (response.users) {
            usersData = response.users;
          } else if (Array.isArray(response)) {
            usersData = response;
          }
          
          if (usersData.length > 0) {
            // Extract online user IDs from the HTTP users data too
            const onlineUsersFromFallback = usersData
              .filter(user => user.online)
              .map(user => String(user._id || user.id));
            
            if (onlineUsersFromFallback.length > 0) {
              setOnlineUsers(onlineUsersFromFallback);
            }
            
            const owner = usersData.find((user) => String(user._id || user.id) === String(userId));
            if (owner) {
              setAccountOwner(owner);
            }
            
            const filteredUsers = usersData.filter((user) => String(user._id || user.id) !== String(userId));
            const updatedUsers = filteredUsers.map((user) => ({
              ...user,
              online: user.online || onlineUsers.includes(user._id || user.id),
            }));
            setUsers(updatedUsers);
          }
        } catch (error) {
        } finally {
          setIsLoadingUsers(false);
        }
      }
    }, 3000);

    // Load last chatted user
    const lastChattedUserId = getLastChattedUserId();
    if (lastChattedUserId) {
      setReceiverId(lastChattedUserId);
      // Find and set selected user
      socketService.emit(SOCKET_EVENTS.GET_USERS, { token });
    }

    return () => {
      clearTimeout(fallbackTimer);
      clearTimeout(initCallListenersTimer);
      socketService.off(SOCKET_EVENTS.GET_USERS, handleGetUsers);
      socketService.off('messageDeleted', handleMessageDeleted);
      
      // Clean up all the new online user listeners
      socketService.off(SOCKET_EVENTS.UPDATE_ONLINE_USERS, handleOnlineUsersUpdate);
      socketService.off('onlineUsers', handleOnlineUsersUpdate);
      socketService.off('updateOnlineUsers', handleOnlineUsersUpdate);
      socketService.off('online-users', handleOnlineUsersUpdate);
      socketService.off('getUsersResponse', handleOnlineUsersUpdate);
      
      socketService.off('userOnline');
      socketService.off('userOffline');
    };
  }, [token, userId, onlineUsers, users.length, getLastChattedUserId]);

  // Update users online status when onlineUsers changes
  useEffect(() => {
    if (users.length > 0 && onlineUsers.length >= 0) {
      setUsers(prevUsers => 
        prevUsers.map(user => {
          const userIdToCheck = String(user._id || user.id);
          const isOnline = onlineUsers.some(onlineId => String(onlineId) === userIdToCheck);
          return {
            ...user,
            online: isOnline
          };
        })
      );
    }
  }, [onlineUsers, users.length]);

  // Update selectedUser's online status when users or onlineUsers changes
  useEffect(() => {
    if (selectedUser && users.length > 0) {
      const updatedUser = users.find(u => String(u._id || u.id) === String(selectedUser._id || selectedUser.id));
      if (updatedUser && updatedUser.online !== selectedUser.online) {
        setSelectedUser(updatedUser);
      }
    }
  }, [users, selectedUser, setSelectedUser]);

  // Monitor connection status
  useEffect(() => {
    const checkConnection = setInterval(() => {
      if (socketService) {
        const status = socketService.getConnectionStatus();
        setIsConnected(socketService.isConnected());
      }
    }, 2000);

    return () => clearInterval(checkConnection);
  }, []);

  // Listen for message status updates
  useEffect(() => {
    if (!socket) return;

    const handleMessageStatusUpdate = (update) => {
      // Find which user this message is with
      for (const [otherUserId, msgs] of Object.entries(messagesByUser)) {
        if (msgs.some(msg => msg.messageId === update.messageId)) {
          updateMessage(otherUserId, update.messageId, { status: update.status });
        }
      }
    };

    const handleReceiveMessage = (msg) => {
      console.log("📥 handleReceiveMessage (in useEffect) called with:", msg);
      
      // Extract sender and receiver IDs - handle case where they are objects with _id
      const senderId = typeof msg.senderId === 'object' 
        ? String(msg.senderId._id || msg.senderId.id) 
        : String(msg.senderId);
      const receiverIdFromMsg = typeof msg.receiverId === 'object' 
        ? String(msg.receiverId._id || msg.receiverId.id) 
        : String(msg.receiverId);
      
      const otherUserId = senderId === String(userId) 
        ? receiverIdFromMsg 
        : senderId;
      console.log("📥 otherUserId (in useEffect):", otherUserId);
      
      const currentMessages = messagesByUser[otherUserId] || [];
      console.log("📥 currentMessages (in useEffect):", currentMessages);
      
      // Remove any temporary messages with the same content and sender
      const withoutTemp = currentMessages.filter(message => 
        !(message.messageId.startsWith('temp-') && 
        (message.type === 'voice' 
          ? (message.audioUrl === msg.audioUrl)
          : message.content === msg.content) && 
        (typeof message.senderId === 'object' 
          ? (message.senderId._id || message.senderId.id) === senderId 
          : message.senderId === senderId)
      ));
      
      // Check if this message already exists
      const exists = withoutTemp.some(message => message.messageId === msg.messageId);
      console.log("📥 exists (in useEffect):", exists);
      
      if (!exists) {
        console.log("📥 Adding message (in useEffect)!", otherUserId, { ...msg, status: 'delivered' });
        addMessage(otherUserId, { ...msg, status: 'delivered' });
        // If we're not currently chatting with this user, increment unread count
        if (otherUserId !== String(receiverId) && senderId === otherUserId) {
          console.log("📥 Incrementing unread count for:", otherUserId);
          incrementUnread(otherUserId);
        }
      }
    };

    socketService.on('messageStatusUpdate', handleMessageStatusUpdate);
    socketService.on('receiveMessage', handleReceiveMessage);
    socketService.on('chat message', handleReceiveMessage);

    return () => {
      socketService.off('messageStatusUpdate', handleMessageStatusUpdate);
      socketService.off('receiveMessage', handleReceiveMessage);
      socketService.off('chat message', handleReceiveMessage);
    };
  }, [socket, messagesByUser, updateMessage, addMessage, userId, incrementUnread, receiverId]);

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

    socketService.on(SOCKET_EVENTS.TYPING, handleTypingEvent);
    socketService.on(SOCKET_EVENTS.STOP_TYPING, handleStopTypingEvent);

    return () => {
      socketService.off(SOCKET_EVENTS.TYPING, handleTypingEvent);
      socketService.off(SOCKET_EVENTS.STOP_TYPING, handleStopTypingEvent);
    };
  }, [socket, userId, selectedUser?._id]);

  // Handlers
  const handleUserClick = (user) => {
    setReceiverId(user._id);
    setSelectedUser(user);
    setLastChattedUserId(user._id);
    fetchMessages(user._id);
    resetUnread(user._id);
    setOpenForwardToggle(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await sendMessage(message, receiverId, replyMessage)) {
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

  const handleAction = (action, messageContent, messageId) => {
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
        handlePinnedMessage(messageId, selectedUser?._id, userId);
        break;
      case "Unpin":
        handleUnPinnedMessage(messageId, selectedUser?._id, userId);
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
      toast.error("Failed to copy message");
    }
  };

  const handleReply = (replyContent) => {
    setReplyMessage(replyContent);
    setOpenToggle(false);
  };

  const handleDelete = async (messageId) => {
    if (await deleteMessage(messageId, receiverId)) {
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

  const forwardMessage = (username, targetUserId) => {
    if (forwardMessageHook(selectedToggle, targetUserId, username, receiverId)) {
      setOpenForwardToggle(false);
      setForwardTo("");
      setFilteredUsers([]);
    }
  };

  const emitTyping = () => {
    if (socketService && isConnected) {
      socketService.startTyping(receiverId);
    }
  };

  const emitStopTyping = () => {
    if (socketService && isConnected) {
      socketService.stopTyping(receiverId);
    }
  };

  return (
    <div className="background min-h-screen">
      <Toaster position="top-center" />
      <CallComponent 
        currentUserId={userId} 
        username={localStorage.getItem('username') || 'User'}
        selectedUser={selectedUser}
      />
      {isConnecting && (
        <div className="fixed inset-0 bg-surface-900/95 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-surface-300 text-lg font-semibold">Connecting to chat...</p>
          </div>
        </div>
      )}
      
      <div className="flex h-screen">
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
            isLoading={isLoadingUsers}
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
              <div className="flex-shrink-0 z-10">
                <ChatHeader 
                  selectedUser={selectedUser}
                  image={image}
                  setImage={setImage}
                  accountOwner={accountOwner}
                  pinnedMessage={pinnedMessage}
                  setPinnedMessage={setPinnedMessage}
                  scrollToMessage={scrollToMessage}
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
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-surface-400 text-sm">Loading messages...</p>
                      </div>
                    </div>
                  ) : (
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
                      isDeleting={isDeleting}
                      isPinning={isPinning}
                    />
                  )}
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
                    isSending={isSending}
                    sendVoiceMessage={sendVoiceMessage}
                    receiverId={receiverId}
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