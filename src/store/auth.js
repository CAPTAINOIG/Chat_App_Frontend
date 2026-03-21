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

      // Actions
      setAuth: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      }),

      setUser: (user) => set({ user }),

      setToken: (token) => set({ token }),

      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      }),

      setLoading: (loading) => set({ isLoading: loading }),

      // Getters
      getUserId: () => get().user?._id || null,
      getUsername: () => get().user?.username || null,
      getToken: () => get().token,

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
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;