import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useChatStore = create(
  persist(
    (set, get) => ({
      // Structure: { [userId]: [messages] }
      messagesByUser: {},
      // Structure: { [userId]: lastMessage }
      lastMessageByUser: {},
      // Structure: { [userId]: unreadCount }
      unreadCounts: {},
      
      // Set all messages for a specific user
      setMessagesForUser: (userId, messages) => {
        return set((state) => ({
          messagesByUser: {...state.messagesByUser, [userId]: messages},
          lastMessageByUser: {...state.lastMessageByUser, [userId]: messages.length > 0 ? messages[messages.length - 1] : null},
        }));
      },

      // Add a single message for a user
      addMessage: (userId, message) => {
        console.log("➕ addMessage called:", userId, message);
        return set((state) => ({
          messagesByUser: {
            ...state.messagesByUser,
            [userId]: [...(state.messagesByUser[userId] || []), message],
          },
          lastMessageByUser: {
            ...state.lastMessageByUser,
            [userId]: message,
          },
        }));
      },

      // Update a message (e.g., change status to sent/delivered/read)
      updateMessage: (userId, messageId, updates) =>
        set((state) => ({
          messagesByUser: {
            ...state.messagesByUser,
            [userId]: state.messagesByUser[userId]?.map((msg) =>
              msg.messageId === messageId ? { ...msg, ...updates } : msg
            ) || [],
          },
        })),

      // Delete a message
      deleteMessage: (userId, messageId) =>
        set((state) => ({
          messagesByUser: {
            ...state.messagesByUser,
            [userId]: state.messagesByUser[userId]?.filter(
              (msg) => msg.messageId !== messageId
            ) || [],
          },
        })),

      // Clear all messages for a user
      clearMessages: (userId) =>
        set((state) => ({
          messagesByUser: {
            ...state.messagesByUser,
            [userId]: [],
          },
          lastMessageByUser: {
            ...state.lastMessageByUser,
            [userId]: null,
          },
        })),

      // Increment unread count for a user
      incrementUnread: (userId) =>
        set((state) => ({
          unreadCounts: {
            ...state.unreadCounts,
            [userId]: (state.unreadCounts[userId] || 0) + 1,
          },
        })),

      // Reset unread count for a user
      resetUnread: (userId) =>
        set((state) => ({
          unreadCounts: {
            ...state.unreadCounts,
            [userId]: 0,
          },
        })),

      // Getters
      getMessagesForUser: (userId) => get().messagesByUser[userId] || [],
      getLastMessageForUser: (userId) => get().lastMessageByUser[userId] || null,
      getUnreadCountForUser: (userId) => get().unreadCounts[userId] || 0,
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useChatStore;
