import { describe, expect, it } from "vitest"

import { spinWalletFetchOutcome, WALLET_FETCH_FAIL_RATE } from "./wallet"

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
