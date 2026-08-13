import { z } from "zod"

import { delay } from "./delay"

export const LOGIN_FAIL_EMAIL = "fail@spin.app"
export const LOGIN_FAIL_PHONE = "0000000000"
export const LOGIN_DELAY_MS = 600

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^\+?[0-9]{8,15}$/

const isEmailOrPhone = (value: string) => {
  const compact = value.replace(/[\s-]/g, "")
  return emailPattern.test(value) || phonePattern.test(compact)
}

export const loginFormSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Phone or email is required.")
    .refine(isEmailOrPhone, "Enter a valid email or phone number."),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>

export const mockLogin = async (identifier: string): Promise<void> => {
  await delay(LOGIN_DELAY_MS)
  const normalized = identifier.trim()
  const digits = normalized.replace(/[\s-]/g, "")
  if (normalized === LOGIN_FAIL_EMAIL || digits === LOGIN_FAIL_PHONE) {
    throw new Error("Unable to sign in. Please try again.")
  }
}

export const displayNameFromIdentifier = (identifier: string): string => {
  if (!identifier.includes("@")) {
    return "Spin User"
  }
  const local = identifier.split("@")[0]
  return local && local.length > 0 ? local : "Spin User"
}
