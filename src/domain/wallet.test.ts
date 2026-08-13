import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { MOCK_BALANCE } from "./mocks"
import {
  getWallet,
  recordTransaction,
  resetWallet,
  spinWalletFetchOutcome,
  WALLET_FETCH_FAIL_RATE,
} from "./wallet"

describe("spinWalletFetchOutcome", () => {
  it("returns error below the fail rate", () => {
    expect(spinWalletFetchOutcome(() => 0)).toBe("error")
    expect(spinWalletFetchOutcome(() => WALLET_FETCH_FAIL_RATE - 0.001)).toBe(
      "error",
    )
  })

  it("returns success at or above the fail rate", () => {
    expect(spinWalletFetchOutcome(() => WALLET_FETCH_FAIL_RATE)).toBe("success")
    expect(spinWalletFetchOutcome(() => 0.99)).toBe("success")
  })
})

describe("recordTransaction", () => {
  beforeEach(() => {
    resetWallet()
    vi.spyOn(Math, "random").mockReturnValue(0.9)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    resetWallet()
  })

  it("prepends a movement and deducts balance", async () => {
    recordTransaction({
      id: "tx-1",
      description: "Sent to Ana Ruiz",
      amount: -10,
      timestamp: "2026-08-13T12:00:00.000Z",
    })
    const wallet = await getWallet()
    expect(wallet.movements[0]).toEqual({
      id: "tx-1",
      description: "Sent to Ana Ruiz",
      amount: -10,
      timestamp: "2026-08-13T12:00:00.000Z",
    })
    expect(wallet.balance).toBe(MOCK_BALANCE - 10)
  })
})
