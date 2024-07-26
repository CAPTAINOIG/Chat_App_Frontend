import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const baseUrl = 'http://localhost:3000';

const Chat = () => {
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const [receiverId, setReceiverId] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    const time = new Date().toLocaleTimeString();
    // console.log(time);

    useEffect(() => {
        const initialSocket = io(baseUrl);
        setSocket(initialSocket);
        getAllUsers(initialSocket);

          // Fetch last chatted user messages
          const lastChattedUserId = localStorage.getItem('lastChattedUserId');
          if (lastChattedUserId) {
              setReceiverId(lastChattedUserId);
              fetchMessages(lastChattedUserId);
              // Find and set the selected user from the stored users list
              initialSocket.emit('getUsers', { token: localStorage.getItem('userToken') });
              initialSocket.on('getUsers', (data) => {
                  if (data.status) {
                      const user = data.users.find(u => u._id === lastChattedUserId);
                      setSelectedUser(user);
                  }
              });
          }
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('recievemessage', (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        socket.on('getUsers', (data) => {
            console.log('Connected with Socket ID:', socket.id);
            if (data.status) {
                setUsers((prev) => {
                    const users = data.users.filter((val) => val._id !== userId);
                    return users;
                });
            }
        });

        return () => {
            socket.off('recievemessage');
        };
    }, [socket]);

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
            console.log('Fetched messages:', response.data);
            if (response.data.status) {
                setMessages(response.data.messages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (message && receiverId) {
            try {
                socket.emit('chat message', { senderId: userId, receiverId, content: message, users: [receiverId, userId] });
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { senderId: userId, receiverId, content: message, timestamp: new Date() }
                ]);
                setMessage('');
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    const handleUserClick = (user) => {
        console.log(user);
        setReceiverId(user._id);
        setSelectedUser(user);
        localStorage.setItem('lastChattedUserId', user._id);
        fetchMessages(user._id);
    };

    return (
        <div className="flex h-screen">
            <div className="w-1/4 bg-gray-100 p-4 border-r border-gray-300">
                <h2 className="text-xl font-bold mb-4">Users</h2>
                <div className="space-y-2">
                    {users.map((item, i) => (
                        <div
                            key={i}
                            className="p-2 cursor-pointer hover:bg-gray-200 rounded"
                            onClick={() => handleUserClick(item)}
                        >
                            {item.username}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                <div className="flex-1 p-4 bg-white">
                    {selectedUser ? (
                        <>
                            <h3 className="text-xl font-semibold mb-4">Chatting with {selectedUser.username}</h3>
                            <div className="space-y-2">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`p-2 rounded ${msg.senderId === userId ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'}`}
                                    >
                                        <strong>{msg.senderId}:</strong> {msg.content} <em className="text-sm text-gray-500">{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : <span>{time}</span>}</em>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p>Select a user to start chatting.</p>
                    )}
                </div>

                <form className="p-4 bg-gray-100 border-t border-gray-300" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message"
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <button
                        type="submit"
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
