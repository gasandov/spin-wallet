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

  it("returns insufficient for chances 26-40", () => {
    expect(spinTransactionOutcome(rngForChance(26))).toBe("insufficient")
    expect(spinTransactionOutcome(rngForChance(40))).toBe("insufficient")
  })

  it("returns unknown for chances 41-50", () => {
    expect(spinTransactionOutcome(rngForChance(41))).toBe("unknown")
    expect(spinTransactionOutcome(rngForChance(50))).toBe("unknown")
  })

  it("returns success for chances 51-100", () => {
    expect(spinTransactionOutcome(rngForChance(51))).toBe("success")
    expect(spinTransactionOutcome(rngForChance(100))).toBe("success")
  })
})
