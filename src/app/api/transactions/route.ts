import { NextResponse } from "next/server"

import { delay } from "@/domain/delay"
import { generateReceiptId, spinTransactionOutcome } from "@/domain/roulette"
import { parseTransactionRequest } from "@/domain/transaction"
import { requireSession } from "@/server/session"
import {
  hasInsufficientFunds,
  recipientLabel,
  recordTransaction,
} from "@/server/wallet-store"

export async function POST(request: Request) {
  const session = await requireSession()
  if (!session.ok) return session.response

  try {
    const body: unknown = await request.json()
    const parsed = parseTransactionRequest(body)

    if (!parsed.ok) {
      if (parsed.field === "contactId") {
        return NextResponse.json(
          { code: "MISSING_RECIPIENT", message: "Recipient is mandatory." },
          { status: 400 },
        )
      }
      return NextResponse.json(
        { code: "INVALID_AMOUNT", message: "Invalid amount." },
        { status: 400 },
      )
    }

    const { amount, contactId } = parsed.data
    if (hasInsufficientFunds(session.identifier, amount)) {
      return NextResponse.json(
        { code: "INSUFFICIENT_FUNDS", message: "Insufficient funds." },
        { status: 422 },
      )
    }

    await delay(800)
    const outcome = spinTransactionOutcome()

    if (outcome === "timeout") {
      await delay(10_000)
      return NextResponse.json(
        { code: "TIMEOUT", message: "Server timeout." },
        { status: 408 },
      )
    }
    if (outcome === "network") {
      return NextResponse.json(
        { code: "NETWORK_ERROR", message: "Connection error." },
        { status: 503 },
      )
    }
    if (outcome === "unknown") {
      return NextResponse.json(
        { code: "UNKNOWN_ERROR", message: "Unexpected error." },
        { status: 500 },
      )
    }

    const timestamp = new Date().toISOString()
    const receiptId = generateReceiptId()
    recordTransaction(session.identifier, {
      id: receiptId,
      description: `Sent to ${recipientLabel(contactId)}`,
      amount: -amount,
      timestamp,
    })

    return NextResponse.json(
      {
        message: "Successful transaction",
        receiptId,
        amount,
        timestamp,
      },
      { status: 200 },
    )
  } catch {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "Malformed request." },
      { status: 400 },
    )
  }
}
