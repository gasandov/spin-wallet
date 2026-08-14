import { describe, expect, it } from "vitest"

import { spinTransactionOutcome } from "./roulette"

const rngForChance = (chance: number) => () => (chance - 1) / 100

describe("spinTransactionOutcome", () => {
  it("returns timeout for chances 1-10", () => {
    expect(spinTransactionOutcome(rngForChance(1))).toBe("timeout")
    expect(spinTransactionOutcome(rngForChance(10))).toBe("timeout")
  })

  it("returns network for chances 11-25", () => {
    expect(spinTransactionOutcome(rngForChance(11))).toBe("network")
    expect(spinTransactionOutcome(rngForChance(25))).toBe("network")
  })

  it("returns unknown for chances 26-35", () => {
    expect(spinTransactionOutcome(rngForChance(26))).toBe("unknown")
    expect(spinTransactionOutcome(rngForChance(35))).toBe("unknown")
  })

  it("returns success for chances 36-100", () => {
    expect(spinTransactionOutcome(rngForChance(36))).toBe("success")
    expect(spinTransactionOutcome(rngForChance(100))).toBe("success")
  })
})
