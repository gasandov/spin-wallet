import { NextResponse } from "next/server"

import { requireSession } from "@/server/session"
import { getMovement } from "@/server/wallet-store"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await requireSession()
  if (!session.ok) return session.response

  const { id } = await context.params
  const movement = getMovement(session.identifier, id)
  if (!movement) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Transaction not found." },
      { status: 404 },
    )
  }
  return NextResponse.json(movement)
}
