import { create } from "zustand"

type SessionState = {
  identifier: string | null
  displayName: string | null
  hasHydrated: boolean
  login: (identifier: string, displayName: string) => void
  logout: () => void
  setHasHydrated: (value: boolean) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  identifier: null,
  displayName: null,
  hasHydrated: false,
  login: (identifier, displayName) => set({ identifier, displayName }),
  logout: () => set({ identifier: null, displayName: null }),
  setHasHydrated: (hasHydrated) => set({ hasHydrated }),
}))
