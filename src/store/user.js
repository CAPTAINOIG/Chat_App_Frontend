import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useUserStore = create(
  persist(
    (set) => ({
      selectedUser: null,
      showOnline: true,
      theme: 'system',
      fontSize: 'medium',
      enterKey: true,
      // Actions
      setSelectedUser: (user) => set({ selectedUser: user }),
      setShowOnline: (status) => set({ showOnline: status }),
      setTheme: (status) => set({ theme: status }),
      setFontSize: (value) => set({ fontSize: value }),
      setEnterKey: (value) => set({ enterKey: value}),

      resetUser: () =>
        set({selectedUser: null, showOnline: true, theme: 'system', fontSize: 'medium', enterKey: true}),
    }),

    {
      name: "user-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        selectedUser: state.selectedUser,
        showOnline: state.showOnline,
        theme: state.theme,
        fontSize: state.fontSize,
        enterKey: state.enterKey,
      }),
    }
  )
);
