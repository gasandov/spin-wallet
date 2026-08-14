import { NextResponse } from "next/server"

import {
  displayNameFromIdentifier,
  loginFormSchema,
  mockLogin,
} from "@/domain/auth"
import { setSessionCookie } from "@/server/session"

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    const parsed = loginFormSchema().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          code: "INVALID_IDENTIFIER",
          message: "Enter a valid email or phone number.",
        },
        { status: 400 },
      )
    }
    const { identifier } = parsed.data
    try {
      await mockLogin(identifier)
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again."
      return NextResponse.json({ code: "AUTH_ERROR", message }, { status: 401 })
    }
    await setSessionCookie(identifier)
    return NextResponse.json({
      identifier,
      displayName: displayNameFromIdentifier(identifier),
    })
  } catch {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "Malformed request." },
      { status: 400 },
    )
  }
}
