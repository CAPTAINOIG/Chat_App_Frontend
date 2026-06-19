import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useUserStore = create(
  persist(
    (set) => ({
      selectedUser: null,
      showOnline: true,
      // Actions
      setSelectedUser: (user) => set({ selectedUser: user }),
      setShowOnline: (status) => set({ showOnline: status }),
      resetUser: () =>
        set({
          selectedUser: null,
          showOnline: true,
        }),
    }),
    {
      name: "user-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        selectedUser: state.selectedUser,
        showOnline: state.showOnline,
      }),
    }
  )
);
