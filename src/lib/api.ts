import { isApiError, parseTransactionSuccess } from "@/domain/transaction"
import type {
  Movement,
  Session,
  TransactionRequest,
  TransactionSuccess,
  Wallet,
} from "@/domain/wallet.types"

export class WalletApiError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = "WalletApiError"
    this.code = code
  }
}

const parseJson = async (response: Response): Promise<unknown> =>
  response.json()

const throwIfError = (response: Response, data: unknown): void => {
  if (response.ok) return
  if (isApiError(data)) {
    throw new WalletApiError(data.code, data.message)
  }
  throw new WalletApiError("UNKNOWN_ERROR", "Unexpected error.")
}

const parseSession = (data: unknown): Session | null => {
  if (typeof data !== "object" || data === null) return null
  const record = data as Record<string, unknown>
  if (
    typeof record.identifier !== "string" ||
    typeof record.displayName !== "string"
  ) {
    return null
  }
  return { identifier: record.identifier, displayName: record.displayName }
}

const parseWallet = (data: unknown): Wallet | null => {
  if (typeof data !== "object" || data === null) return null
  const record = data as Record<string, unknown>
  if (typeof record.balance !== "number" || !Array.isArray(record.movements)) {
    return null
  }
  return { balance: record.balance, movements: record.movements as Movement[] }
}

const parseMovement = (data: unknown): Movement | null => {
  if (typeof data !== "object" || data === null) return null
  const record = data as Record<string, unknown>
  if (
    typeof record.id !== "string" ||
    typeof record.description !== "string" ||
    typeof record.amount !== "number" ||
    typeof record.timestamp !== "string"
  ) {
    return null
  }
  return {
    id: record.id,
    description: record.description,
    amount: record.amount,
    timestamp: record.timestamp,
  }
}

export const postLogin = async (identifier: string): Promise<Session> => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier }),
  })
  const data = await parseJson(response)
  throwIfError(response, data)
  const parsed = parseSession(data)
  if (!parsed) {
    throw new WalletApiError("UNKNOWN_ERROR", "Unexpected error.")
  }
  return parsed
}

export const postLogout = async (): Promise<void> => {
  const response = await fetch("/api/auth/logout", { method: "POST" })
  if (!response.ok) {
    const data = await parseJson(response).catch(() => null)
    throwIfError(response, data)
  }
}

export const getSession = async (): Promise<Session> => {
  const response = await fetch("/api/auth/session")
  const data = await parseJson(response)
  throwIfError(response, data)
  const parsed = parseSession(data)
  if (!parsed) {
    throw new WalletApiError("UNKNOWN_ERROR", "Unexpected error.")
  }
  return parsed
}

export const getWallet = async (): Promise<Wallet> => {
  const response = await fetch("/api/wallet")
  const data = await parseJson(response)
  throwIfError(response, data)
  const parsed = parseWallet(data)
  if (!parsed) {
    throw new WalletApiError("UNKNOWN_ERROR", "Unexpected error.")
  }
  return parsed
}

export const getMovement = async (id: string): Promise<Movement | null> => {
  const response = await fetch(`/api/transactions/${id}`)
  if (response.status === 404) return null
  const data = await parseJson(response)
  throwIfError(response, data)
  const parsed = parseMovement(data)
  if (!parsed) {
    throw new WalletApiError("UNKNOWN_ERROR", "Unexpected error.")
  }
  return parsed
}

export const postTransaction = async (
  input: TransactionRequest,
): Promise<TransactionSuccess> => {
  const response = await fetch("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const data = await parseJson(response)
  throwIfError(response, data)
  const parsed = parseTransactionSuccess(data)
  if (!parsed) {
    throw new WalletApiError("UNKNOWN_ERROR", "Unexpected error.")
  }
  return parsed
}
