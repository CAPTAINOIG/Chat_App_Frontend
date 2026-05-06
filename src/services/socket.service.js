/**
 * Socket.io Service for Frontend
 * Improved version with better reliability and message status
 */
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class SocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
    this.listeners = new Map();
    this.messageQueue = [];
    this.isReconnecting = false;
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
      auth: {
        token: token
      }
    });

    this.setupDefaultListeners(token);
    return this.socket;
  }

  setupDefaultListeners(token) {
    this.socket.on('connect', () => {
      this.socket.emit('user-online', this.userId);
      this.socket.emit('getUsers', { token });
      
      // Send queued messages
      this.flushMessageQueue();
    });

    this.socket.on('disconnect', (reason) => {
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      this.socket.emit('user-online', this.userId);
      this.socket.emit('getUsers', { token });
      this.flushMessageQueue();
    });
  }

  async sendMessage(receiverId, content, replyTo = null) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        // Queue message if offline
        const queuedMessage = { receiverId, content, replyTo, resolve, reject };
        this.messageQueue.push(queuedMessage);
        reject(new Error('Socket not connected - message queued'));
        return;
      }

      const messageId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      const payload = {
        messageId,
        senderId: this.userId,
        receiverId,
        content,
        replyTo,
        timestamp: new Date(),
      };

      // Send message without waiting for acknowledgment
      // The backend will send the message back via 'receiveMessage' event
      this.socket.emit('chat message', payload);
      
      // Resolve immediately since we're not waiting for ack
      resolve({ messageId, payload, status: 'sent' });
    });
  }

  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const queuedMessage = this.messageQueue.shift();
      this.sendMessage(queuedMessage.receiverId, queuedMessage.content, queuedMessage.replyTo)
        .then(queuedMessage.resolve)
        .catch(queuedMessage.reject);
    }
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

  markMessageAsRead(messageId) {
    if (this.socket?.connected) {
      this.socket.emit('markAsRead', { messageId });
    }
  }

  deleteMessage(messageId) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }
      // Emit deleteMessage event (matches your backend pattern)
      this.socket.emit('deleteMessage', { messageId });
      // Resolve immediately since backend will handle deletion and broadcast messageDeleted
      resolve({ success: true });
    });
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

  getConnectionStatus() {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    if (this.isReconnecting) return 'reconnecting';
    return 'disconnected';
  }
}

export default new SocketService();