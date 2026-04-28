import { useState, useCallback } from 'react';
import { getMessage } from '../api/authApi';
import { toast } from 'sonner';

export const useMessagePagination = (userId) => {
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const MESSAGES_PER_PAGE = 20;

  // Fetch messages with pagination
  const fetchMessages = useCallback(async (senderId, pageNum = 1, reset = true) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await getMessage(userId, senderId, {
        page: pageNum,
        limit: MESSAGES_PER_PAGE
      });

      if (response.status) {
        const newMessages = response.messages || [];
        const pagination = response.pagination || {};

        if (reset) {
          setMessages(newMessages);
        } else {
          // Prepend older messages (for infinite scroll up)
          setMessages(prev => [...newMessages, ...prev]);
        }

        setPage(pageNum);
        setTotalPages(pagination.totalPages || 1);
        setHasMore(pageNum < (pagination.totalPages || 1));
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }, [userId, loading]);

  // Load more messages (older messages)
  const loadMoreMessages = useCallback(async (senderId) => {
    if (!hasMore || loading) return;
    
    const nextPage = page + 1;
    await fetchMessages(senderId, nextPage, false);
  }, [fetchMessages, hasMore, loading, page]);

  // Add new message to the list
  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  // Remove message from the list
  const removeMessage = useCallback((messageId) => {
    setMessages(prev => prev.filter(msg => msg.messageId !== messageId));
  }, []);

  // Update message in the list
  const updateMessage = useCallback((messageId, updates) => {
    setMessages(prev => prev.map(msg => 
      msg.messageId === messageId ? { ...msg, ...updates } : msg
    ));
  }, []);

  // Reset pagination state
  const resetPagination = useCallback(() => {
    setMessages([]);
    setPage(1);
    setTotalPages(0);
    setHasMore(true);
    setLoading(false);
  }, []);

  return {
    messages,
    setMessages,
    hasMore,
    loading,
    page,
    totalPages,
    fetchMessages,
    loadMoreMessages,
    addMessage,
    removeMessage,
    updateMessage,
    resetPagination,
  };
};