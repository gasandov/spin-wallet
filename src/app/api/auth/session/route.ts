import { NextResponse } from "next/server"

import { requireSession, sessionPayload } from "@/server/session"

export async function GET() {
  const session = await requireSession()
  if (!session.ok) return session.response
  return NextResponse.json(sessionPayload(session.identifier))
}
