import { z } from "zod"

import type {
  ApiError,
  TransactionRequest,
  TransactionSuccess,
} from "./wallet.types"

export const sanitizeAmount = (raw: string): string => {
  const cleaned = raw.replace(/[^\d.]/g, "")
  const dot = cleaned.indexOf(".")
  if (dot === -1) return cleaned
  const whole = cleaned.slice(0, dot)
  const decimals = cleaned
    .slice(dot + 1)
    .replace(/\./g, "")
    .slice(0, 2)
  return `${whole}.${decimals}`
}

export const hasAtMostTwoDecimals = (amount: number): boolean => {
  if (!Number.isFinite(amount)) return false
  return Number(amount.toFixed(2)) === amount
}

export const transactionFormSchema = (balance: number) =>
  z
    .object({
      amount: z.string().trim().min(1, "Amount is required."),
      contactId: z.string(),
      newContact: z.string(),
    })
    .superRefine((values, ctx) => {
      if (values.amount.length > 0) {
        const amount = Number(values.amount)
        if (!Number.isFinite(amount) || amount <= 0) {
          ctx.addIssue({
            code: "custom",
            path: ["amount"],
            message: "Amount must be greater than 0.",
          })
        } else if (!hasAtMostTwoDecimals(amount)) {
          ctx.addIssue({
            code: "custom",
            path: ["amount"],
            message: "Amount must have at most 2 decimal places.",
          })
        } else if (amount > balance) {
          ctx.addIssue({
            code: "custom",
            path: ["amount"],
            message: "Insufficient funds.",
          })
        }
      }
      if (
        values.contactId.length === 0 &&
        values.newContact.trim().length === 0
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["contactId"],
          message: "Recipient is mandatory.",
        })
      }
    })

export type TransactionFormValues = z.infer<
  ReturnType<typeof transactionFormSchema>
>

export const transactionRequestSchema = z.object({
  amount: z.number().finite().positive().refine(hasAtMostTwoDecimals),
  contactId: z.string().min(1),
})

export type ParseRequestResult =
  | { ok: true; data: TransactionRequest }
  | { ok: false; field: "amount" | "contactId" }

export const parseTransactionRequest = (body: unknown): ParseRequestResult => {
  const parsed = transactionRequestSchema.safeParse(body)
  if (parsed.success) return { ok: true, data: parsed.data }
  const field = parsed.error.issues[0]?.path[0]
  return { ok: false, field: field === "contactId" ? "contactId" : "amount" }
}

export const isApiError = (data: unknown): data is ApiError =>
  typeof data === "object" &&
  data !== null &&
  typeof (data as ApiError).code === "string" &&
  typeof (data as ApiError).message === "string"

export const parseTransactionSuccess = (
  data: unknown,
): TransactionSuccess | null => {
  if (typeof data !== "object" || data === null) return null
  const record = data as Record<string, unknown>
  if (
    typeof record.message !== "string" ||
    typeof record.receiptId !== "string" ||
    typeof record.amount !== "number" ||
    typeof record.timestamp !== "string"
  ) {
    return null
  }
  return {
    message: record.message,
    receiptId: record.receiptId,
    amount: record.amount,
    timestamp: record.timestamp,
  }
}
