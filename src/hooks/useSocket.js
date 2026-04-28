import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from '../constants/socketEvents';

const baseUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const useSocket = (userId, token) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId || !token) return;

    const socketInstance = io(baseUrl);
    setSocket(socketInstance);

    // Connection events
    socketInstance.on('connect', () => {
      setIsConnected(true);
      socketInstance.emit(SOCKET_EVENTS.USER_ONLINE, userId);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    // Online users
    socketInstance.on(SOCKET_EVENTS.UPDATE_ONLINE_USERS, (onlineUsersIds) => {
      setOnlineUsers(onlineUsersIds);
    });

    return () => {
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [userId, token]);

  const emitEvent = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  };

  const onEvent = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const offEvent = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  return {
    socket,
    onlineUsers,
    isConnected,
    emitEvent,
    onEvent,
    offEvent
  };
};