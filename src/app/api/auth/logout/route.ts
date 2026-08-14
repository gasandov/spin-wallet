import { NextResponse } from "next/server"

import { clearSessionCookie, requireSession } from "@/server/session"

export async function POST() {
  const session = await requireSession()
  if (!session.ok) return session.response
  await clearSessionCookie()
  return NextResponse.json({ ok: true })
}
