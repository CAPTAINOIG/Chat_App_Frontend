import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { FaReply, FaCopy, FaForward, FaStar, FaThumbtack, FaTrashAlt, FaCheckSquare, FaShareAlt, FaInfoCircle } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import UserList from './UserList';
import ChatInput from './ChatInput';
import Message from './Message';


// const baseUrl = "https://chat-app-backend-seuk.onrender.com";
const baseUrl = "http://localhost:3000";


const Chat = () => {
    const messageRefs = useRef({});
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const [receiverId, setReceiverId] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(null);
    const [openToggle, setOpenToggle] = useState(false);
    const [selectedMsg, setSelectedMsg] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [replyMessage, setReplyMessage] = useState('');
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [openForwardToggle, setOpenForwardToggle] = useState(false);
    const [selectedToggle, setSelectedToggle] = useState(false);
    const [forwardTo, setForwardTo] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);

    const time = new Date().toLocaleTimeString();

    const data = [
        {
            icon: <FaReply />,
            text: 'Reply',
        },
        {
            icon: <FaCopy />,
            text: 'Copy',
        },
        {
            icon: <FaTrashAlt />,
            text: 'Delete',
        },
        {
            icon: <FaForward />,
            text: 'Forward',
        },
        {
            icon: <FaStar />,
            text: 'Star',
        },
        {
            icon: <FaThumbtack />,
            text: 'Pin',
        },
        {
            icon: <FaCheckSquare />,
            text: 'Select',
        },
        {
            icon: <FaShareAlt />,
            text: 'Share',
        },
        {
            icon: <FaInfoCircle />,
            text: 'Info',
        },
    ];

    // step 1: fetch all users, this is done once on page load and i get the last chatted user id from local storage and fetch the messages for that user.
    useEffect(() => {
        const initialSocket = io(baseUrl);
        // console.log(initialSocket);
        setSocket(initialSocket);
        initialSocket.emit('user-online', userId)

        // Call the getAllUsers function here
        getAllUsers(initialSocket);

        const lastChattedUserId = localStorage.getItem('lastChattedUserId');
        if (lastChattedUserId) {
            setReceiverId(lastChattedUserId);
            fetchMessages(lastChattedUserId);
            initialSocket.emit('getUsers', { token: localStorage.getItem('userToken') });

            initialSocket.on('getUsers', (data) => {
                if (data.status) {
                    const user = data.users.find(u => u._id === lastChattedUserId);
                    setSelectedUser(user);
                }
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
        initialSocket.on('update-online-users', (onlineUsersIds) => {
            // console.log(onlineUsersIds)
            setOnlineUsers(onlineUsersIds);
        });
    }

    // step 3: listen to messages or receive messages from one user to the owner of acct.
    useEffect(() => {
        if (!socket) return;
        socket.on('typing', (data) => {
            if (data.senderId !== userId && data.isTyping) {
                setIsTyping(true);
            }
        });

        socket.on('stopTyping', (data) => {
            if (data.senderId !== userId && !data.isTyping) {
                setIsTyping(false);
            }
        });

        socket.on('recievemessage', (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        // step 2: listen to users or get all users from the server
        socket.on('getUsers', (data) => {
            if (data.status) {
                // filter out the user who is chatting with i.e d owner of acct.
                const filteredUsers = data.users.filter((user) => user._id !== userId)
                // map the filtered users and add online status
                const updatedUsers = filteredUsers.map((user => ({
                    ...user,
                    // add online status
                    online: onlineUsers.includes(user._id)
                })));
                // console.log(updatedUsers)
                setUsers(updatedUsers)
            }
        });

        return () => {
            socket.off('recievemessage');
            socket.off('getUsers');
            socket.off('typing');
            socket.off('stopTyping');
        };
    }, [socket, onlineUsers, userId]);


    // This checks for user token and see if the user is connected through socket
    const getAllUsers = async (socket) => {
        if (!socket) return;

        try {
            const token = localStorage.getItem('userToken');
            socket.emit("getUsers", { token });
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchMessages = async (senderId) => {
        setMessages([]);
        try {
            const response = await axios.get(`${baseUrl}/user/getMessage?userId=${userId}&receiverId=${senderId}`);
            if (response.data.status) {
                setMessages(response.data.messages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            senderId: userId,
            receiverId,
            replyTo: replyMessage,
            content: message,
            users: [receiverId, userId]
        }
        if (message && receiverId) {
            try {
                socket.emit('chat message', payload);
                // socket.emit('chat message', { senderId: userId, receiverId, replyTo: replyMessage, content: message, users: [receiverId, userId] });

                setMessages((prevMessages) => [
                    ...prevMessages,
                    // { senderId: userId, receiverId, content: message,  timestamp: new Date() }
                    payload
                ]);
                setMessage('');
                setReplyMessage('');
                setShowEmojiPicker(false);

            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    const handleTyping = (e) => {
        socket.emit('typing', {
            senderId: userId,
            receiverId: receiverId,
            content: e.target.value
        });
        setIsTyping(true);
    }

    const handleStopTyping = (e) => {
        socket.emit('stopTyping', { senderId: userId, receiverId, content: e.target.value, isTyping: false });
        setIsTyping(false);
    }

    // useEffect(() => {
    //     if (!socket) return; 
    //     socket.on('typing', (data) => {
    //         console.log("Typing notification received:", data);
    //         if (data.senderId !== userId && data.receiverId === userId) {
    //             setTyping(true);
    //         }
    //     });

    //     socket.on('stopTyping', (data) => {
    //         console.log("Stop typing notification received:", data);
    //         if (data.senderId !== userId && data.receiverId === userId) {
    //             setTyping(false);
    //         }
    //     });

    //     return () => {
    //         socket.off('typing');
    //         socket.off('stopTyping');
    //     };
    // }, [userId, socket]);

    const handleUserClick = (user) => {
        setReceiverId(user._id);
        setSelectedUser(user);
        localStorage.setItem('lastChattedUserId', user._id);
        fetchMessages(user._id);
        setOpenForwardToggle(false)
    };

    const handleToggle = (msgId) => {
        setOpenToggle(!openToggle);
        setSelectedMsg(msgId);
    }

    const toggleEmojiPicker = () => {
        setShowEmojiPicker((prev) => !prev);
    }

    const handleEmojiClick = (emojiData) => {
        setMessage((prev) => prev + emojiData.emoji);
        // setShowEmojiPicker(false);
    };

    const scrollToMessage = (messageId) => {
        const targetElement = messageRefs.current[messageId];
        console.log('Target Element:', targetElement);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };



    const handleAction = (action, message, _id) => {
        if (action === 'Copy') {
            handleCopy(message);
        }
        else if (action === 'Reply') {
            handleReply(message);
        }
        else if (action === 'Delete') {
            handleDelete(_id);
            setOpenToggle(false);
        }
        else if (action === 'Forward') {
            handleForwardMessage(_id, users);
        }
    }

    const handleCopy = async (message) => {
        try {
            await navigator.clipboard.writeText(message);
            toast.success('Message copied to clipboard!');
            setOpenToggle(false);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleReply = async (replyMessage) => {
        setReplyMessage(replyMessage);
        setOpenToggle(false);
    };

    const handleDelete = async (_id) => {
        if (!_id) {
            toast.error('invalid message id');
            return;
        }
        try {
            const response = await axios.delete(`${baseUrl}/user/deleteMessage/${_id}`);
            toast.success(`${response.data.message}`);
            const deleteMessage = messages.filter((item) => item._id !== _id);
            setMessages(deleteMessage)
        } catch (error) {
            if (error.response.data.status) {
                toast.error(`${error.response.data.message}`);
            }
            else if (error.response.status === 404) {
                toast.error('wrong path');
            }
            else {
                toast.error(`${error.response.data.message}`);
            }
        }
    };

    const handleForwardMessage = (_id, users) => {
        setUsers(users);
        setSelectedToggle(_id);
        setOpenForwardToggle(!openForwardToggle);
        setOpenToggle(false)
    };


    const handleForwardClick = (_id, users) => {
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
        console.log(username, receiverId);
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
        <div className='background'>
            <div className="flex flex-col md:flex-row h-screen">

                <UserList users={users} handleUserClick={handleUserClick} />

                <div className="flex-1 flex flex-col bg-opacity-80" id='scroll-container'>
                    <div className="flex-1">
                        {selectedUser ? (
                            <>
                                <h3 className="text-xl font-semibold mb-4 text-gray-900 bg-gray-100 border-t border-gray-300 fixed w-full py-6 p-3 z-20">Chatting with {selectedUser.username}</h3>
                                {isTyping && <p className='text-xl font-bold right-10 text-blue-900 absolute top-10 z-50'>{selectedUser.username} typing...</p>}
                                <div className="space-y-2 py-[12%]" id='scroll'>
                                    {messages.map((msg, index) => (
                                        <Message
                                            msg={msg}
                                            userId={userId}
                                            selectedUser={selectedUser}
                                            messageRefs={messageRefs}
                                            openToggle={openToggle}
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
                                        />
                                    ))}
                                </div>

                            </>
                        ) : (
                            <p className="text-gray-700 bg-gray-100 border-t border-gray-300 py-6 p-3 text-xl">Select a user to start chatting.</p>
                        )}
                    </div>
                    <ChatInput
                        handleSubmit={handleSubmit}
                        toggleEmojiPicker={toggleEmojiPicker}
                        showEmojiPicker={showEmojiPicker}
                        handleEmojiClick={handleEmojiClick}
                        message={message}
                        setMessage={setMessage}
                        handleTyping={handleTyping}
                        handleStopTyping={handleStopTyping}
                        replyMessage={replyMessage}
                        setReplyMessage={setReplyMessage}
                    />
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Chat;
