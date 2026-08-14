import { MOCK_BALANCE, MOCK_FAVORITES, MOCK_MOVEMENTS } from "@/domain/mocks"
import type { Movement, Wallet } from "@/domain/wallet.types"

const snapshot = (): Wallet => ({
  balance: MOCK_BALANCE,
  movements: MOCK_MOVEMENTS.map((movement) => ({ ...movement })),
})

const wallets = new Map<string, Wallet>()

export const resetWallets = (): void => {
  wallets.clear()
}

export const getOrCreateWallet = (identifier: string): Wallet => {
  let current = wallets.get(identifier)
  if (!current) {
    current = snapshot()
    wallets.set(identifier, current)
  }
  return { balance: current.balance, movements: current.movements.slice() }
}

export const hasInsufficientFunds = (
  identifier: string,
  amount: number,
): boolean => getOrCreateWallet(identifier).balance < amount

export const recordTransaction = (
  identifier: string,
  movement: Movement,
): void => {
  const current = wallets.get(identifier) ?? snapshot()
  wallets.set(identifier, {
    balance: Number((current.balance + movement.amount).toFixed(2)),
    movements: [movement, ...current.movements],
  })
}

export const getMovement = (
  identifier: string,
  receiptId: string,
): Movement | undefined => {
  const wallet = wallets.get(identifier)
  return wallet?.movements.find((movement) => movement.id === receiptId)
}

export const recipientLabel = (contactId: string): string => {
  if (contactId.startsWith("new:")) return contactId.slice(4)
  const favorite = MOCK_FAVORITES.find((contact) => contact.id === contactId)
  return favorite ? favorite.name : contactId
}
