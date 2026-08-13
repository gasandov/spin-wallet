import { describe, expect, it } from "vitest"

import {
  parseTransactionRequest,
  sanitizeAmount,
  transactionFormSchema,
} from "./transaction"

const fieldError = (
  values: { amount: string; contactId: string; newContact: string },
  balance: number,
  field: "amount" | "contactId",
) => {
  const result = transactionFormSchema(balance).safeParse(values)
  if (result.success) return undefined
  return result.error.issues.find((issue) => issue.path[0] === field)?.message
}

describe("sanitizeAmount", () => {
  it("caps decimals at 2 places", () => {
    expect(sanitizeAmount("12.345")).toBe("12.34")
  })

  it("strips a leading minus", () => {
    expect(sanitizeAmount("-1")).toBe("1")
  })

  it("strips letters", () => {
    expect(sanitizeAmount("10abc")).toBe("10")
  })
})

describe("parseTransactionRequest", () => {
  it("accepts a valid request", () => {
    expect(parseTransactionRequest({ amount: 10, contactId: "c-ana" })).toEqual(
      { ok: true, data: { amount: 10, contactId: "c-ana" } },
    )
  })

  it("rejects amount 0", () => {
    expect(parseTransactionRequest({ amount: 0, contactId: "c-ana" })).toEqual({
      ok: false,
      field: "amount",
    })
  })

  it("rejects a negative amount", () => {
    expect(parseTransactionRequest({ amount: -5, contactId: "c-ana" })).toEqual(
      {
        ok: false,
        field: "amount",
      },
    )
  })

  it("rejects a string amount as hijacked payload", () => {
    expect(
      parseTransactionRequest({ amount: "10", contactId: "c-ana" }),
    ).toEqual({ ok: false, field: "amount" })
  })

  it("rejects more than 2 decimal places", () => {
    expect(
      parseTransactionRequest({ amount: 10.123, contactId: "c-ana" }),
    ).toEqual({ ok: false, field: "amount" })
  })

  it("rejects a missing recipient", () => {
    expect(parseTransactionRequest({ amount: 10, contactId: "" })).toEqual({
      ok: false,
      field: "contactId",
    })
  })
})

describe("transactionFormSchema", () => {
  it("accepts a valid form payload", () => {
    expect(
      transactionFormSchema(100).safeParse({
        amount: "50",
        contactId: "c-ana",
        newContact: "",
      }).success,
    ).toBe(true)
  })

  it("rejects amount 0", () => {
    expect(
      fieldError(
        { amount: "0", contactId: "c-ana", newContact: "" },
        100,
        "amount",
      ),
    ).toBe("Amount must be greater than 0.")
  })

  it("rejects a negative amount", () => {
    expect(
      fieldError(
        { amount: "-1", contactId: "c-ana", newContact: "" },
        100,
        "amount",
      ),
    ).toBe("Amount must be greater than 0.")
  })

  it("rejects an amount over balance", () => {
    expect(
      fieldError(
        { amount: "101", contactId: "c-ana", newContact: "" },
        100,
        "amount",
      ),
    ).toBe("Insufficient funds.")
  })

  it("rejects a missing recipient", () => {
    expect(
      fieldError(
        { amount: "10", contactId: "", newContact: "" },
        100,
        "contactId",
      ),
    ).toBe("Recipient is mandatory.")
  })

  it("rejects more than 2 decimal places", () => {
    expect(
      fieldError(
        { amount: "10.123", contactId: "c-ana", newContact: "" },
        100,
        "amount",
      ),
    ).toBe("Amount must have at most 2 decimal places.")
  })
})
