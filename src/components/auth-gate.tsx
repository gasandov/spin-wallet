"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"

import { useSessionStore } from "@/store/session"

type AuthGateProps = {
  children: ReactNode
}

const PUBLIC_PATHS = new Set(["/login"])

// ponytail: session lives in localStorage. Ceiling: gated UI waits on rehydrate.
// Upgrade: httpOnly cookie + proxy.ts so the server can redirect.
export const AuthGate = ({ children }: AuthGateProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const identifier = useSessionStore((state) => state.identifier)
  const hasHydrated = useSessionStore((state) => state.hasHydrated)

  useEffect(() => {
    const rehydrate = async () => {
      await useSessionStore.persist.rehydrate()
      useSessionStore.getState().setHasHydrated(true)
    }
    rehydrate()
  }, [])

  useEffect(() => {
    if (!hasHydrated) return
    const isAuthed = Boolean(identifier)
    if (!isAuthed && !PUBLIC_PATHS.has(pathname)) {
      router.replace("/login")
      return
    }
    if (isAuthed && pathname === "/login") {
      router.replace("/")
    }
  }, [hasHydrated, identifier, pathname, router])

  if (!hasHydrated) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted">
        <p role="status">Loading...</p>
      </div>
    )
  }

  const isAuthed = Boolean(identifier)
  if (!isAuthed && !PUBLIC_PATHS.has(pathname)) return null
  if (isAuthed && pathname === "/login") return null

  return children
}
