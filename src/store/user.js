import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useUserStore = create(
  persist(
    (set) => ({
      selectedUser: null,
      showOnline: true,
      theme: 'system',
      // Actions
      setSelectedUser: (user) => set({ selectedUser: user }),
      setShowOnline: (status) => set({ showOnline: status }),
      setTheme: (status) => set({ theme: status}),
      resetUser: () =>
        set({selectedUser: null, showOnline: true, theme: 'system'}),
    }),
    {
      name: "user-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        selectedUser: state.selectedUser,
        showOnline: state.showOnline,
        theme: state.theme,
      }),
    }
  )
);
