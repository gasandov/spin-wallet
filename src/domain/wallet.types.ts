export type Movement = {
  id: string
  description: string
  amount: number
  timestamp: string
}

export type Contact = {
  id: string
  name: string
  identifier: string
}

export type Wallet = {
  balance: number
  movements: Movement[]
}

export type TransactionRequest = {
  amount: number
  contactId: string
}

export type TransactionSuccess = {
  message: string
  receiptId: string
  amount: number
  timestamp: string
}

export type ApiError = {
  code: string
  message: string
}

export type TransactionOutcome =
  "timeout" | "network" | "insufficient" | "unknown" | "success"
