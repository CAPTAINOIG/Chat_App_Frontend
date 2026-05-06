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
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [deletedMessageIds, setDeletedMessageIds] = useState(new Set());

  // Fetch messages for a specific user
  const fetchMessages = useCallback(async (senderId) => {
    setMessages([]);
    setIsLoading(true);
    // Clear deleted messages cache when fetching new conversation
    setDeletedMessageIds(new Set());
    
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
      
      // Filter out deleted messages (both by isDeleted flag and local cache)
      const activeMessages = messages.filter(msg => 
        !msg.isDeleted && !deletedMessageIds.has(msg.messageId)
      );
      console.log('📥 Fetched messages:', messages.length, 'Active messages:', activeMessages.length);
      
      setMessages(activeMessages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      toast.error("Failed to fetch messages");
    } finally {
      setIsLoading(false);
    }
  }, [userId, deletedMessageIds]);

  const sendMessage = useCallback(async (content, receiverId, replyMessage = "") => {
    if (!content.trim() || !receiverId || !socket) {
      return false;
    }
    
    setIsSending(true);
    // Generate a temporary message ID for immediate display
    const tempMessageId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    try {
      const tempMessage = {
        messageId: tempMessageId,
        senderId: userId,
        receiverId,
        content: content.trim(),
        replyTo: replyMessage,
        timestamp: new Date(),
        status: 'sending'
      };
      setMessages((prevMessages) => [...prevMessages, tempMessage]);
      // Send via improved socket service
      const result = await socket.sendMessage(receiverId, content.trim(), replyMessage);
      // Update the temporary message with the real message ID
      setMessages((prevMessages) => 
        prevMessages.map(msg => 
          msg.messageId === tempMessageId 
            ? { ...msg, messageId: result.messageId, status: 'sent' }
            : msg
        )
      );
      return true;
    } catch (error) {
      // Remove the failed message from local state
      setMessages((prevMessages) => 
        prevMessages.filter(msg => msg.messageId !== tempMessageId)
      );
      toast.error("Failed to send message");
      return false;
    } finally {
      setIsSending(false);
    }
  }, [userId, socket, setMessages]);

  // Delete a message
  const deleteMessage = useCallback(async (messageId) => {
    console.log('🗑️ Delete message called with ID:', messageId);
    if (!messageId) {
      toast.error("Invalid message id");
      return false;
    }

    setIsDeleting(true);
    try {
      // Try API deletion first (for database persistence)
      try {
        const response = await deleteMessageApi(messageId);
        // Also emit socket event to notify other users in real-time
        if (socket && socket.deleteMessage) {
          await socket.deleteMessage(messageId);
        }
        toast.success(response.message || "Message deleted successfully");
      } catch (apiError) {
        // If API fails, try socket method (your backend pattern)
        if (socket && socket.deleteMessage) {
          await socket.deleteMessage(messageId);
          toast.success("Message deleted successfully");
        } else {
          throw new Error("No deletion method available");
        }
      }
      // Add to deleted messages cache
      setDeletedMessageIds(prev => new Set([...prev, messageId]));
      // Remove from local state immediately
      setMessages(prev => {
        const filtered = prev.filter(item => item.messageId !== messageId);
        return filtered;
      });
      return true;
    } catch (error) {
      toast.error("Failed to delete message: " + (error.message || "Unknown error"));
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [socket, setMessages]);

    // Fetch pinned messages
  const fetchPinnedMessages = useCallback(async (senderId, receiverId) => {
    try {
      const response = await getPinnedMessages(senderId, receiverId);
      if (response) {
        setPinnedMessage(response.pinMessage);
      }
    } catch (error) {
    }
  }, []);

  // Pin a message
  const pinMessage = useCallback(async (messageId, receiverId, senderId) => {
    setIsPinning(true);
    try {
      const response = await pinMessageApi(messageId, senderId, receiverId);
      if (response.status === "success" || response.success) {
        toast.success(response.message || "Message pinned successfully");
        await fetchPinnedMessages(senderId, receiverId);
        return true;
      } else {
        toast.error(response.error?.message || response.message || "Failed to pin message");
        return false;
      }
    } catch (error) {
      toast.error(handleApiError(error));
      return false;
    } finally {
      setIsPinning(false);
    }
  }, [fetchPinnedMessages]);

  // Unpin a message
  const unpinMessage = useCallback(async (messageId, receiverId, senderId) => {
    setIsPinning(true);
    try {
      const response = await unpinMessageApi(messageId, senderId, receiverId);
      if (response.status === "success" || response.success) {
        toast.success(response.message || "Message unpinned successfully");
        setPinnedMessage(response?.pinMessage);
        return true;
      } else {
        toast.error(response.error?.message || response.message || "Failed to unpin message");
        return false;
      }
    } catch (error) {
      toast.error(handleApiError(error));
      return false;
    } finally {
      setIsPinning(false);
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
    // Loading states
    isLoading,
    isSending,
    isDeleting,
    isPinning,
  };
};