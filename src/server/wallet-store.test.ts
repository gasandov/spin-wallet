import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { MOCK_BALANCE } from "@/domain/mocks"

import {
  getMovement,
  getOrCreateWallet,
  hasInsufficientFunds,
  recipientLabel,
  recordTransaction,
  resetWallets,
} from "./wallet-store"

describe("wallet-store", () => {
  beforeEach(() => {
    resetWallets()
  })

  afterEach(() => {
    resetWallets()
  })

  it("prepends a movement and deducts balance for that user", () => {
    recordTransaction("ana@spin.app", {
      id: "tx-1",
      description: "Sent to Ana Ruiz",
      amount: -10,
      timestamp: "2026-08-13T12:00:00.000Z",
    })
    const wallet = getOrCreateWallet("ana@spin.app")
    expect(wallet.movements[0]).toEqual({
      id: "tx-1",
      description: "Sent to Ana Ruiz",
      amount: -10,
      timestamp: "2026-08-13T12:00:00.000Z",
    })
    expect(wallet.balance).toBe(MOCK_BALANCE - 10)
  })

  it("keeps wallets isolated per identifier", () => {
    recordTransaction("ana@spin.app", {
      id: "tx-1",
      description: "Sent to Marco Diaz",
      amount: -10,
      timestamp: "2026-08-13T12:00:00.000Z",
    })
    expect(getOrCreateWallet("lee@spin.app").balance).toBe(MOCK_BALANCE)
    expect(getMovement("lee@spin.app", "tx-1")).toBeUndefined()
    expect(getMovement("ana@spin.app", "tx-1")?.id).toBe("tx-1")
  })

  it("rejects an amount over the current balance", () => {
    expect(hasInsufficientFunds("ana@spin.app", MOCK_BALANCE)).toBe(false)
    expect(hasInsufficientFunds("ana@spin.app", MOCK_BALANCE + 0.01)).toBe(true)
  })

  it("resolves favorite and new-contact labels", () => {
    expect(recipientLabel("c-ana")).toBe("Ana Ruiz")
    expect(recipientLabel("new:pat@spin.app")).toBe("pat@spin.app")
  })
})
