"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, type ReactNode } from "react"

import { getSession } from "@/lib/api"
import { useLocaleStore } from "@/store/locale"
import { useSessionStore } from "@/store/session"

type AuthGateProps = {
  children: ReactNode
}

const PUBLIC_PATHS = new Set(["/login"])

export const AuthGate = ({ children }: AuthGateProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const identifier = useSessionStore((state) => state.identifier)
  const hasHydrated = useSessionStore((state) => state.hasHydrated)
  const messages = useLocaleStore((state) => state.messages)
  const sessionCheckPath = useRef<string | null>(null)

  useEffect(() => {
    if (PUBLIC_PATHS.has(pathname) || identifier) {
      useSessionStore.getState().setHasHydrated(true)
      return
    }
    if (sessionCheckPath.current === pathname) return
    sessionCheckPath.current = pathname

    const loadSession = async () => {
      try {
        const session = await getSession()
        if (session) {
          useSessionStore
            .getState()
            .login(session.identifier, session.displayName)
        } else {
          useSessionStore.getState().logout()
        }
      } catch {
        useSessionStore.getState().logout()
      } finally {
        useSessionStore.getState().setHasHydrated(true)
      }
    }
    loadSession()
  }, [identifier, pathname])

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
        <p role="status">{messages.common.loading}</p>
      </div>
    )
  }

  const isAuthed = Boolean(identifier)
  if (!isAuthed && !PUBLIC_PATHS.has(pathname)) return null
  if (isAuthed && pathname === "/login") return null

  return children
}
