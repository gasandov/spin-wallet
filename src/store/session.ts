import { create } from "zustand"
import { persist } from "zustand/middleware"

type SessionState = {
  identifier: string | null
  displayName: string | null
  hasHydrated: boolean
  login: (identifier: string, displayName: string) => void
  logout: () => void
  setHasHydrated: (value: boolean) => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      identifier: null,
      displayName: null,
      hasHydrated: false,
      login: (identifier, displayName) => set({ identifier, displayName }),
      logout: () => set({ identifier: null, displayName: null }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "spin-session",
      skipHydration: true,
      partialize: (state) => ({
        identifier: state.identifier,
        displayName: state.displayName,
      }),
      onRehydrateStorage: () => () => {
        useSessionStore.getState().setHasHydrated(true)
      },
    },
  ),
)
