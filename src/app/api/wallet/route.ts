import { NextResponse } from "next/server"

import { delay } from "@/domain/delay"
import { spinWalletFetchOutcome, WALLET_DELAY_MS } from "@/domain/wallet"
import { requireSession } from "@/server/session"
import { getOrCreateWallet } from "@/server/wallet-store"

export async function GET() {
  const session = await requireSession()
  if (!session.ok) return session.response

  await delay(WALLET_DELAY_MS)
  if (spinWalletFetchOutcome() === "error") {
    return NextResponse.json(
      {
        code: "WALLET_FETCH_ERROR",
        message: "Could not load your wallet. Please try again.",
      },
      { status: 503 },
    )
  }

  return NextResponse.json(getOrCreateWallet(session.identifier))
}
