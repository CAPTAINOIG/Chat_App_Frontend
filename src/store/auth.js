import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      lastChattedUserId: null,
      hydrated: false, 

      // Actions
      setAuth: (user, token) => {
        const userId = user?._id || user?.id || null; 
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

      setHydrated: () => set({ hydrated: true }),

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
        state?.setHydrated();
      }
    }
  )
);

export default useAuthStore;