import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import {
  FaReply,
  FaCopy,
  FaForward,
  FaStar,
  FaThumbtack,
  FaTrashAlt,
  FaCheckSquare,
  FaShareAlt,
  FaInfoCircle,
} from "react-icons/fa";
import UserList from "./UserList";
import ChatInput from "./ChatInput";
import Message from "./Message";
import useMessageStore from "../store/chat";
import { v4 as uuidv4 } from "uuid";
import ProfilePic from "./ProfilePic";
import { Toaster, toast } from "sonner";
import { getMessage } from "../api/authApi";

const baseUrl = "https://chat-app-backend-seuk.onrender.com";
// const baseUrl = "http://localhost:3000";

const Chat = () => {
  const messageRefs = useRef({});
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");

  const updateMessage = useMessageStore((state) => state.updateMessage);
  const newData = useMessageStore((state) => state.data.messages);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [receiverId, setReceiverId] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(null);
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
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [accountOwner, setAccountOwner] = useState(false);
  const [image, setImage] = useState(null);

  const time = new Date().toLocaleTimeString();

  const data = [
    {
      icon: <FaReply />,
      text: "Reply",
    },
    {
      icon: <FaCopy />,
      text: "Copy",
    },
    {
      icon: <FaTrashAlt />,
      text: "Delete",
    },
    {
      icon: <FaForward />,
      text: "Forward",
    },
    // {
    //   icon: <FaStar />,
    //   text: "Star",
    // },
    // {
    //   icon: <FaStar />,
    //   text: "Unstar",
    // },
    {
      icon: <FaThumbtack />,
      text: "Pin",
    },
    {
      icon: <FaThumbtack />,
      text: "Unpin",
    },
    // {
    //   icon: <FaCheckSquare />,
    //   text: "Select",
    // },
    // {
    //   icon: <FaShareAlt />,
    //   text: "Share",
    // },
    // {
    //   icon: <FaInfoCircle />,
    //   text: "Info",
    // },
  ];

  // step 1: fetch all users, this is done once on page load and i get the last chatted user id from local storage and fetch the messages for that user.
  useEffect(() => {
    const initialSocket = io(baseUrl);
    setSocket(initialSocket);
    initialSocket.emit("user-online", userId);

    // Call the getAllUsers function here
    getAllUsers(initialSocket);

    const lastChattedUserId = localStorage.getItem("lastChattedUserId");
    if (lastChattedUserId) {
      setReceiverId(lastChattedUserId);
      fetchMessages(lastChattedUserId);
      initialSocket.emit("getUsers", {
        token: localStorage.getItem("userToken"),
      });

      initialSocket.on("getUsers", (data) => {
        console.log("getUsers event received on frontend:", data);
        if (data.status) {
          const user = data.users.find((u) => u._id === lastChattedUserId);
          setSelectedUser(user);
        }
      });
      // Listen for new messages
      initialSocket.on("newMessage", (message) => {
        // console.log("New message received on frontend:", message);
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    }

    // step 4 : listen to online users. endpoint to get online users
    // initialSocket.on('update-online-users', (onlineUsersIds) => {
    //     console.log(onlineUsersIds)
    //     setOnlineUsers(onlineUsersIds);
    // });

    fetchOnlineUsers(initialSocket);

    return () => {
      initialSocket.disconnect();
    };
  }, []);

  const fetchOnlineUsers = async (initialSocket) => {
    initialSocket.on("update-online-users", (onlineUsersIds) => {
      // console.log(onlineUsersIds)
      setOnlineUsers(onlineUsersIds);
    });
  };

  // step 3: listen to messages or receive messages from one user to the owner of acct.
  useEffect(() => {
    if (!socket) return;
    
    socket.on("recievemessage", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // step 2: listen to users or get all users from the server
    socket.on("getUsers", (data) => {
      if (data.status) {
        const owner = data.users.find((user) => user._id === userId);
        setAccountOwner(owner);
        // filter out the user who is chatting with i.e d owner of acct.
        const filteredUsers = data.users.filter((user) => user._id !== userId);
        // map the filtered users and add online status
        const updatedUsers = filteredUsers.map((user) => ({
          ...user,
          // add online status
          online: onlineUsers.includes(user._id),
        }));
        // console.log(updatedUsers)
        setUsers(updatedUsers);
      }
    });

    return () => {
      socket.off("recievemessage");
      socket.off("getUsers");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [socket, onlineUsers, userId]);

  // This checks for user token and see if the user is connected through socket
  const getAllUsers = async (socket) => {
    if (!socket) return;
    try {
      const token = localStorage.getItem("userToken");
      socket.emit("getUsers", { token });
    } catch (error) {
      toast.error("Failed to fetch users");
    }
  };

  const fetchMessages = async (senderId) => {
    setMessages([]);
    try {
      const response = await getMessage(userId, senderId);
      if (response.status) {
        setMessages(response.messages);
      }
    } catch (error) {
      toast.error("Failed to fetch messages");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const messageId = uuidv4();
    const payload = {
      senderId: userId,
      receiverId,
      replyTo: replyMessage,
      messageId: messageId,
      content: message,
      users: [receiverId, userId],
      timestamp: new Date(),
    };
    if (message && receiverId) {
      try {
        socket.emit("chat message", payload);
        setMessages((prevMessages) => [...prevMessages, payload]);
        setMessage("");
        setReplyMessage("");
        setShowEmojiPicker(false);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };
  
// 1️⃣ Listen for typing events from server
useEffect(() => {
  if (!socket) return;
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

  socket.on("typing", handleTypingEvent);
  socket.on("stopTyping", handleStopTypingEvent);

  return () => {
    socket.off("typing", handleTypingEvent);
    socket.off("stopTyping", handleStopTypingEvent);
  };
}, [socket, userId, selectedUser?._id]);

// 2️⃣ Emit typing events when YOU type
const emitTyping = () => {
  if (!socket) return;
  socket.emit("typing", { senderId: userId, receiverId });
};

const emitStopTyping = () => {
  if (!socket) return;
  socket.emit("stopTyping", { senderId: userId, receiverId });
};


  const handleUserClick = (user) => {
    setReceiverId(user._id);
    setSelectedUser(user);
    localStorage.setItem("lastChattedUserId", user._id);
    fetchMessages(user._id);
    setOpenForwardToggle(false);
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
    // setShowEmojiPicker(false);
  };

  const scrollToMessage = (messageId) => {
    const targetElement = messageRefs.current[messageId];
    console.log("Target Element:", targetElement);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleAction = (action, message, messageId, receiverId, senderId) => {
    if (action === "Copy") {
      handleCopy(message);
    } else if (action === "Reply") {
      handleReply(message);
    } else if (action === "Delete") {
      handleDelete(messageId);
      setOpenToggle(false);
    } else if (action === "Forward") {
      handleForwardMessage(messageId, users);
    } else if (action === "Pin") {
      handlePinnedMessage(messageId, receiverId, senderId);
      setOpenToggle(false);
    } else if (action === "Unpin") {
      handleUnPinnedMessage(messageId, receiverId, senderId);
      setOpenToggle(false);
    }
  };

  const handleCopy = async (message) => {
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Message copied to clipboard!");
      setOpenToggle(false);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleReply = async (replyMessage) => {
    setReplyMessage(replyMessage);
    setOpenToggle(false);
  };

  const handleDelete = async (messageId) => {
    if (!messageId) {
      toast.error("invalid message id");
      return;
    }
    try {
      const response = await axios.delete(
        `${baseUrl}/user/deleteMessage/${messageId}`
      );
      toast.success(`${response.data.message}`);
      const deleteMessage = messages.filter(
        (item) => item.messageId !== messageId
      );
      setMessages(deleteMessage);
    } catch (error) {
      if (error.response.data.status) {
        toast.error(`${error.response.data.message}`);
      } else if (error.response.status === 404) {
        toast.error("wrong path");
      } else {
        toast.error(`${error.response.data.message}`);
      }
    }
  };

  const handlePinnedMessage = async (messageId, receiverId, senderId) => {
    console.log(messageId, receiverId, senderId);
    try {
      const response = await axios.post(`${baseUrl}/user/pinMessage`, {
        messageId: messageId,
        senderId: senderId,
        receiverId: receiverId,
      });
      console.log(response);

      if (response.data.status === "success") {
        fetchPinnedMessages(senderId, receiverId);
      } else {
        toast.error(`${response.data.error.message}`);
      }
    } catch (error) {
      console.log(error);
      toast.error(`${error.response.data.message}`);
    }
  };

  const handleUnPinnedMessage = async (messageId, receiverId, senderId) => {
    try {
      const response = await axios.post(`${baseUrl}/user/unpinMessage`, {
        messageId: messageId,
        senderId: senderId,
        receiverId: receiverId,
      });
      if (response.data.status === "success") {
        toast.success(`${response.data.message}`);
        setPinnedMessage(response?.data?.pinMessage);
      } else {
        toast.error(`${response.data.error.message}`);
      }
    } catch (error) {
      toast.error(`${error.response.data.message}`);
    }
  };

  const fetchPinnedMessages = async (senderId, receiverId) => {
    try {
      const response = await axios.get(`${baseUrl}/user/getPinMessage`, {
        params: {
          userId: senderId,
          receiverId: receiverId,
        },
      });

      if (response.data) {
        toast.success("Pinned message added successfully!");
        setPinnedMessage(response?.data?.pinMessage);
      } else {
        toast.error("Failed to add pinned message!");
      }
    } catch (error) {
      toast.error("Failed to add pinned message!");
    }
  };

  const handleForwardMessage = (messageId, users) => {
    setUsers(users);
    setSelectedToggle(messageId);
    setOpenForwardToggle(!openForwardToggle);
    setOpenToggle(false);
  };

  const handleForwardClick = (messageId, users) => {
    console.log(_id, users);
    // setForwardTo(user.username);
  };

  const handleForwardTo = (e) => {
    const inputValue = e.target.value;
    setForwardTo(inputValue);
    const filteredUsers = users.filter((user) =>
      user.username.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredUsers(filteredUsers);
  };

  const forwardMessage = async (username, receiverId) => {
    // try {
    //     const response = await axios.post(`${baseUrl}/messages/forward`, {
    //         content,
    //         senderId: "userId",
    //         recipients: receiverId,
    //     });
    //     console.log("Message forwarded successfully:", response.data);
    // } catch (error) {
    //     console.error("Error forwarding message:", error);
    // }
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

        <div
          className="flex-1 flex flex-col bg-opacity-80"
          id="scroll-container"
        >
          <div className="flex-1">
            {selectedUser ? (
              <>
                <div className="flex items-center justify-between fixed w-full z-10 px-5 py-5 bg-white">
                  <div className="flex items-center">
                    <div className="ms-16">
                      <p className="">Chatting with {selectedUser.username}</p>
                      <p
                        className={`ml-15 ${
                          selectedUser.online
                            ? "text-green-500"
                            : "text-red-300"
                        }`}
                      >
                        ({selectedUser.online ? "Online" : "Offline"})
                      </p>
                    </div>
                    <div className="z-50 absolute">
                      <ProfilePic
                        selectedUser={selectedUser}
                        image={image}
                        setImage={setImage}
                      />
                    </div>
                  </div>
                </div>

                {pinnedMessage &&
                  pinnedMessage.length > 0 &&
                  selectedUser.username && (
                    <div className="absolute w-full top-[13%] z-20 bg-gray-100 border-t border-gray-300 flex flex-col gap-2 px-5 mb-4">
                      <button
                        onClick={() => setPinnedMessage([])}
                        className="text-blue-900 text-sm font-semibold"
                      >
                        Clear Pinned Messages
                      </button>
                      {pinnedMessage.map((pinnedMessage) => (
                        <div
                          key={pinnedMessage._id}
                          className="flex gap-5 p-1 items-center"
                        >
                          {pinnedMessage.senderId === userId ? (
                            <div className="flex gap-5 text-xl font-semibold text-gray-900">
                              <span className="text-sm text-dark">
                                {pinnedMessage.content}
                              </span>

                              <span className="text-sm">
                                {pinnedMessage.timestamp
                                  ? new Date(
                                      pinnedMessage.timestamp
                                    ).toLocaleTimeString()
                                  : null}
                              </span>
                            </div>
                          ) : (
                            <div className="flex gap-5 text-xl font-semibold text-gray-900">
                              <span className="text-sm text-dark">
                                {pinnedMessage.content}
                              </span>

                              <span className="text-sm">
                                {pinnedMessage.timestamp
                                  ? new Date(
                                      pinnedMessage.timestamp
                                    ).toLocaleTimeString()
                                  : null}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                {isTyping && typingUser && (
                  <p className="text-xl font-bold right-10 text-blue-900 absolute top-10 z-50">
                     {users.find(u => u._id === typingUser)?.username} is typing...
                  </p>
                )}

                <div className="space-y-2 py-[12%]" id="scroll">
                  {messages.map((msg, index) => (
                    <Message
                      msg={msg}
                      userId={userId}
                      selectedUser={selectedUser}
                      messageRefs={messageRefs}
                      openToggle={openToggle}
                      setOpenToggle={setOpenToggle}
                      selectedMsg={selectedMsg}
                      handleToggle={handleToggle}
                      data={data}
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
                      setMessages={setMessages}
                      messages={messages}
                      pinnedMessage={pinnedMessage}
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-700 bg-gray-100 border-t border-gray-300 py-6 p-3 text-xl">
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
