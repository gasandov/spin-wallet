import { describe, expect, it } from "vitest"

import { loginFormSchema } from "./auth"

const identifierError = (identifier: string) => {
  const result = loginFormSchema().safeParse({ identifier })
  if (result.success) return undefined
  return result.error.issues[0]?.message
}

describe("loginFormSchema", () => {
  it("accepts an email", () => {
    expect(
      loginFormSchema().safeParse({ identifier: "ana@spin.app" }).success,
    ).toBe(true)
  })

  it("accepts a phone number", () => {
    expect(
      loginFormSchema().safeParse({ identifier: "+15551234567" }).success,
    ).toBe(true)
  })

  it("rejects an empty identifier", () => {
    expect(identifierError("")).toBe("Phone or email is required.")
  })

  it("rejects junk that is neither email nor phone", () => {
    expect(identifierError("not-a-contact")).toBe(
      "Enter a valid email or phone number.",
    )
  })
})
