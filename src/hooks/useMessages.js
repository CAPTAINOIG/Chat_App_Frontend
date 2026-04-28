import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { 
  getMessage, 
  deleteMessage as deleteMessageApi,
  pinMessage as pinMessageApi,
  unpinMessage as unpinMessageApi,
  getPinnedMessages,
  handleApiError
} from '../api/authApi';

export const useMessages = (userId, socket) => {
  const [messages, setMessages] = useState([]);
  const [pinnedMessage, setPinnedMessage] = useState(null);

  // Fetch messages for a specific user
  const fetchMessages = useCallback(async (senderId) => {
    setMessages([]);
    try {
      const response = await getMessage(userId, senderId);
      let messages = [];
      if (response.status && response.messages) {
        messages = response.messages;
      } else if (response.success && response.data && response.data.messages) {
        messages = response.data.messages;
      } else if (response.messages) {
        messages = response.messages;
      } else if (Array.isArray(response)) {
        messages = response;
      }
      setMessages(messages);
    } catch (error) {
      toast.error("Failed to fetch messages");
    }
  }, [userId]);

  const sendMessage = useCallback((content, receiverId, replyMessage = "") => {
    if (!content.trim() || !receiverId || !socket) return false;

    try {
      const result = socket.sendMessage ? 
        socket.sendMessage(receiverId, content.trim(), replyMessage) :
        (() => {
          const messageId = uuidv4();
          const payload = {
            messageId,
            senderId: userId,
            receiverId,
            content: content.trim(),
            replyTo: replyMessage,
            timestamp: new Date(),
          };
          socket.emit("chat message", payload);
          return { messageId, payload };
        })();

      const messageData = result.payload || {
        messageId: result.messageId || uuidv4(),
        senderId: userId,
        receiverId,
        content: content.trim(),
        replyTo: replyMessage,
        timestamp: new Date(),
      };

      setMessages((prevMessages) => {
        const exists = prevMessages.some(msg => msg.messageId === messageData.messageId);
        if (exists) return prevMessages;
        return [...prevMessages, messageData];
      });
      
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      return false;
    }
  }, [userId, socket]);

  // Delete a message
  const deleteMessage = useCallback(async (messageId) => {
    if (!messageId) {
      toast.error("Invalid message id");
      return false;
    }

    try {
      const response = await deleteMessageApi(messageId);
      toast.success(response.message || "Message deleted successfully");
      setMessages(prev => prev.filter(item => item.messageId !== messageId));
      return true;
    } catch (error) {
      console.error("Delete message error:", error);
      toast.error(handleApiError(error, "Failed to delete message"));
      return false;
    }
  }, []);

  // Pin a message
  const pinMessage = useCallback(async (messageId, receiverId, senderId) => {
    try {
      const response = await pinMessageApi(messageId, senderId, receiverId);
      
      if (response.status === "success") {
        toast.success(response.message || "Message pinned successfully");
        await fetchPinnedMessages(senderId, receiverId);
        return true;
      } else {
        toast.error(response.error?.message || "Failed to pin message");
        return false;
      }
    } catch (error) {
      console.error("Pin message error:", error);
      toast.error(handleApiError(error, "Failed to pin message"));
      return false;
    }
  }, []);

  // Unpin a message
  const unpinMessage = useCallback(async (messageId, receiverId, senderId) => {
    try {
      const response = await unpinMessageApi(messageId, senderId, receiverId);

      if (response.status === "success") {
        toast.success(response.message || "Message unpinned successfully");
        setPinnedMessage(response?.pinMessage);
        return true;
      } else {
        toast.error(response.error?.message || "Failed to unpin message");
        return false;
      }
    } catch (error) {
      console.error("Unpin message error:", error);
      toast.error(handleApiError(error, "Failed to unpin message"));
      return false;
    }
  }, []);

  // Fetch pinned messages
  const fetchPinnedMessages = useCallback(async (senderId, receiverId) => {
    try {
      const response = await getPinnedMessages(senderId, receiverId);
      if (response) {
        setPinnedMessage(response.pinMessage);
      }
    } catch (error) {
      console.error("Failed to load pinned messages:", error);
    }
  }, []);

  // Forward a message
  const forwardMessage = useCallback((messageId, targetUserId, targetUsername) => {
    if (!targetUserId || !messageId || !socket) {
      toast.error("Please select a user to forward to");
      return false;
    }

    const messageToForward = messages.find(msg => msg.messageId === messageId);
    if (!messageToForward) {
      toast.error("Message not found");
      return false;
    }

    const newMessageId = uuidv4();
    const payload = {
      senderId: userId,
      receiverId: targetUserId,
      messageId: newMessageId,
      content: `[Forwarded] ${messageToForward.content}`,
      users: [targetUserId, userId],
      timestamp: new Date(),
    };

    try {
      socket.emit("chat message", payload);
      toast.success(`Message forwarded to ${targetUsername}`);
      return true;
    } catch (error) {
      console.error("Error forwarding message:", error);
      toast.error("Failed to forward message");
      return false;
    }
  }, [messages, userId, socket]);

  return {
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
    forwardMessage,
  };
};