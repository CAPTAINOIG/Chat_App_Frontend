import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Use sessionStorage instead of localStorage for better security
// sessionStorage is cleared when the browser tab is closed
const useAuthStore = create(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      lastChattedUserId: null,
      hydrated: false, // Add hydration flag

      // Actions
      setAuth: (user, token) => {
        console.log("Setting auth with user:", user); // Debug log
        const userId = user?._id || user?.id || null; // Handle both _id and id
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          lastChattedUserId: userId
        });
      },

      setUser: (user) => set({ user }),

      setToken: (token) => set({ token }),

      setLastChattedUserId: (lastChattedUserId) => set({ lastChattedUserId }),

      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      }),

      setLoading: (loading) => set({ isLoading: loading }),

      setHydrated: () => set({ hydrated: true }), // Action to mark as hydrated

      // Getters
      getUserId: () => {
        const user = get().user;
        return user?._id || user?.id || null;
      },
      getUsername: () => get().user?.username || null,
      getToken: () => get().token,
      getLastChattedUserId: () => get().lastChattedUserId,

      // Check if user is authenticated
      checkAuth: () => {
        const { token, user } = get();
        return !!(token && user);
      }
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage
      // Only persist these fields
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        lastChattedUserId: state.lastChattedUserId
      }),
      onRehydrateStorage: () => (state) => {
        // Mark as hydrated when storage is rehydrated
        state?.setHydrated();
      }
    }
  )
);

export default useAuthStore;