import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { displayNameFromIdentifier } from "@/domain/auth"
import { SESSION_COOKIE } from "@/domain/session"

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
}

export const unauthorizedResponse = () =>
  NextResponse.json(
    { code: "UNAUTHORIZED", message: "Sign in required." },
    { status: 401 },
  )

export const getSessionIdentifier = async (): Promise<string | null> => {
  const store = await cookies()
  const value = store.get(SESSION_COOKIE)?.value?.trim()
  return value && value.length > 0 ? value : null
}

export const setSessionCookie = async (identifier: string): Promise<void> => {
  const store = await cookies()
  store.set(SESSION_COOKIE, identifier, cookieOptions)
}

export const clearSessionCookie = async (): Promise<void> => {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

type RequireSessionResult =
  { ok: true; identifier: string } | { ok: false; response: NextResponse }

export const requireSession = async (): Promise<RequireSessionResult> => {
  const identifier = await getSessionIdentifier()
  if (!identifier) return { ok: false, response: unauthorizedResponse() }
  return { ok: true, identifier }
}

export const sessionPayload = (identifier: string) => ({
  identifier,
  displayName: displayNameFromIdentifier(identifier),
})
