import type { TransactionOutcome } from "./wallet.types"

export const spinTransactionOutcome = (
  random: () => number = Math.random,
): TransactionOutcome => {
  const chance = Math.floor(random() * 100) + 1
  if (chance <= 10) return "timeout"
  if (chance <= 25) return "network"
  if (chance <= 35) return "unknown"
  return "success"
}

export const generateReceiptId = (): string =>
  `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
