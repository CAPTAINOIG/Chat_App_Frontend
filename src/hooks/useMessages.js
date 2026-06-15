import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { 
  getMessage, 
  deleteMessage as deleteMessageApi,
  pinMessage as pinMessageApi,
  unpinMessage as unpinMessageApi,
  getPinnedMessages,
  uploadVoiceNote,
  handleApiError
} from '../api/authApi';
import useChatStore from '../store/chat';

export const useMessages = (userId, socket) => {
  const {
    messagesByUser,
    setMessagesForUser,
    addMessage,
    updateMessage,
    deleteMessage: deleteMessageFromStore,
  } = useChatStore();
  
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [deletedMessageIds, setDeletedMessageIds] = useState(new Set());

  // Fetch messages for a specific user
  const fetchMessages = useCallback(async (senderId) => {
    console.log("📤 fetchMessages called for senderId:", senderId);
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
      const activeMessages = messages.filter(msg => !msg.isDeleted && !deletedMessageIds.has(msg.messageId));
      console.log("📤 setting messagesForUser!", senderId, activeMessages);
      setMessagesForUser(senderId, activeMessages);
    } catch (error) {
      toast.error("Failed to fetch messages");
    } finally {
      setIsLoading(false);
    }
  }, [userId, deletedMessageIds, setMessagesForUser]);

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
      addMessage(receiverId, tempMessage);
      const result = await socket.sendMessage(receiverId, content.trim(), replyMessage);
      // Update the temporary message with the real message ID
      updateMessage(receiverId, tempMessageId, { messageId: result.messageId, status: 'sent' });
      return true;
    } catch (error) {
      deleteMessageFromStore(receiverId, tempMessageId);
      toast.error("Failed to send message");
      return false;
    } finally {
      setIsSending(false);
    }
  }, [userId, socket, addMessage, updateMessage, deleteMessageFromStore]);

  // Delete a message
  const deleteMessage = useCallback(async (messageId, receiverId) => {
    if (!messageId || !receiverId) {
      toast.error("Invalid message id");
      return false;
    }
    setIsDeleting(true);
    try {
      const response = await deleteMessageApi(messageId);
      toast.success(response.message || "Message deleted successfully");
      // Add to deleted messages cache
      setDeletedMessageIds(prev => new Set([...prev, messageId]));
      // Remove from store
      deleteMessageFromStore(receiverId, messageId);
      return true;
    } catch (error) {
      console.log(error)
      toast.error(error.response.data.message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [deleteMessageFromStore]);

    // Fetch pinned messages
  const fetchPinnedMessages = useCallback(async (senderId, receiverId) => {
    try {
      const response = await getPinnedMessages(senderId, receiverId);
      if (response) {
        let pinnedMessages = null;
        if (response.pinMessage) {
          pinnedMessages = response.pinMessage;
        } else if (response.data?.pinMessage) {
          pinnedMessages = response.data.pinMessage;
        } else if (response.data?.pinnedMessages) {
          pinnedMessages = response.data.pinnedMessages;
        } else if (response.pinnedMessages) {
          pinnedMessages = response.pinnedMessages;
        }
        setPinnedMessage(pinnedMessages);
      }
    } catch (error) {
      toast.error(handleApiError(error));
      return false;
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
  const forwardMessage = useCallback((messageId, targetUserId, targetUsername, receiverId) => {
    if (!targetUserId || !messageId || !socket) {
      toast.error("Please select a user to forward to");
      return false;
    }

    const messages = messagesByUser[receiverId] || [];
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
      addMessage(targetUserId, payload);
      toast.success(`Message forwarded to ${targetUsername}`);
      return true;
    } catch (error) {
      console.error("Error forwarding message:", error);
      toast.error("Failed to forward message");
      return false;
    }
  }, [messagesByUser, userId, socket, addMessage]);

  // Send a voice message
  const sendVoiceMessage = useCallback(async (audioBlob, duration, receiverId, replyMessage = "") => {
    if (!audioBlob || !receiverId || !socket) {
      return false;
    }
    
    setIsSending(true);
    // Generate a temporary message ID for immediate display
    const tempMessageId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    try {
      // Convert blob to base64
      const base64Audio = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });
      
      // Upload to backend
      const uploadResult = await uploadVoiceNote(base64Audio, duration);
      
      const tempMessage = {
        messageId: tempMessageId,
        senderId: userId,
        receiverId,
        type: 'voice',
        audioUrl: uploadResult.data.audioUrl,
        duration: uploadResult.data.duration,
        replyTo: replyMessage,
        timestamp: new Date(),
        status: 'sending'
      };
      
      addMessage(receiverId, tempMessage);
      
      // Send via socket
      const result = await socket.sendMessage(receiverId, null, replyMessage, 'voice', uploadResult.data.audioUrl, uploadResult.data.duration);
      
      // Update the temporary message with the real message ID
      updateMessage(receiverId, tempMessageId, { messageId: result.messageId, status: 'sent' });
      
      return true;
    } catch (error) {
      // Remove the failed message from local state
      deleteMessageFromStore(receiverId, tempMessageId);
      toast.error('Failed to send voice note');
      return false;
    } finally {
      setIsSending(false);
    }
  }, [userId, socket, addMessage, updateMessage, deleteMessageFromStore]);

  return {
    messagesByUser,
    pinnedMessage,
    setPinnedMessage,
    fetchMessages,
    sendMessage,
    sendVoiceMessage,
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
