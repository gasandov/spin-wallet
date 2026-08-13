import { isApiError, parseTransactionSuccess } from "@/domain/transaction"
import type {
  TransactionRequest,
  TransactionSuccess,
} from "@/domain/wallet.types"

export class WalletApiError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = "WalletApiError"
    this.code = code
  }
}

export const postTransaction = async (
  input: TransactionRequest,
): Promise<TransactionSuccess> => {
  const response = await fetch("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const data: unknown = await response.json()
  if (!response.ok) {
    if (isApiError(data)) {
      throw new WalletApiError(data.code, data.message)
    }
    throw new WalletApiError("UNKNOWN_ERROR", "Unexpected error.")
  }
  const parsed = parseTransactionSuccess(data)
  if (!parsed) {
    throw new WalletApiError("UNKNOWN_ERROR", "Unexpected error.")
  }
  return parsed
}
