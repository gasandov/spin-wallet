import { describe, expect, it } from "vitest"

import {
  DEFAULT_LOCALE,
  dictionaries,
  en,
  es,
  interpolate,
  messageForErrorCode,
} from "./messages"

const leafKeys = (value: unknown, prefix = ""): string[] => {
  if (typeof value !== "object" || value === null) return [prefix]
  return Object.entries(value).flatMap(([key, child]) =>
    leafKeys(child, prefix ? `${prefix}.${key}` : key),
  )
}

describe("messages", () => {
  it("keeps Spanish as the default and in sync with English keys", () => {
    expect(DEFAULT_LOCALE).toBe("es")
    expect(dictionaries.es).toBe(es)
    expect(leafKeys(es)).toEqual(leafKeys(en))
    expect(es.auth.signIn).toBe("Iniciar sesión")
  })

  it("interpolates named placeholders", () => {
    expect(interpolate("To {name}", { name: "Ana" })).toBe("To Ana")
  })

  it("maps known error codes and falls back for unknown ones", () => {
    expect(messageForErrorCode("INSUFFICIENT_FUNDS", es)).toBe(
      es.errors.INSUFFICIENT_FUNDS,
    )
    expect(messageForErrorCode("NOPE", es)).toBe(es.errors.UNKNOWN_ERROR)
  })
})
