/**
 * Socket.io Service for Frontend
 * Matches the backend Socket.IO implementation
 */
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class SocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
    this.listeners = new Map();
  }

  connect(userId, token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.userId = userId;
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.setupDefaultListeners(token);
    return this.socket;
  }

  setupDefaultListeners(token) {
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.socket.emit('user-online', this.userId);
      this.socket.emit('getUsers', { token });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      this.socket.emit('user-online', this.userId);
      this.socket.emit('getUsers', { token });
    });
  }

  sendMessage(receiverId, content, replyTo = null) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const payload = {
      messageId,
      senderId: this.userId,
      receiverId,
      content,
      replyTo,
      timestamp: new Date(),
    };

    this.socket.emit('chat message', payload);
    return { messageId, payload };
  }

  startTyping(receiverId) {
    if (this.socket?.connected) {
      this.socket.emit('typing', {
        senderId: this.userId,
        receiverId,
      });
    }
  }

  stopTyping(receiverId) {
    if (this.socket?.connected) {
      this.socket.emit('stopTyping', {
        senderId: this.userId,
        receiverId,
      });
    }
  }

  on(event, callback) {
    if (!this.socket) return;
    
    this.socket.on(event, callback);
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    
    this.socket.off(event, callback);
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  disconnect() {
    if (this.socket) {
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.off(event, callback);
        });
      });
      this.listeners.clear();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  getOnlineUsers() {
    return this.onlineUsers || [];
  }
}

export default new SocketService();