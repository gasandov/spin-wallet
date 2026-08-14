import { delay } from "./delay"
import { MOCK_BALANCE, MOCK_MOVEMENTS } from "./mocks"
import type { Movement, Wallet } from "./wallet.types"

export const WALLET_QUERY_KEY = ["wallet"] as const
export const WALLET_DELAY_MS = 400
export const WALLET_FETCH_FAIL_RATE = 0.2
export const RECENT_MOVEMENT_COUNT = 5

const snapshot = (): Wallet => ({
  balance: MOCK_BALANCE,
  movements: MOCK_MOVEMENTS.map((movement) => ({ ...movement })),
})

let state: Wallet = snapshot()

export const resetWallet = (): void => {
  state = snapshot()
}

export const recordTransaction = (movement: Movement): void => {
  state = {
    balance: Number((state.balance + movement.amount).toFixed(2)),
    movements: [movement, ...state.movements],
  }
}

export const getMovement = (id: string): Movement | undefined =>
  state.movements.find((movement) => movement.id === id)

export const spinWalletFetchOutcome = (
  random: () => number = Math.random,
): "error" | "success" =>
  random() < WALLET_FETCH_FAIL_RATE ? "error" : "success"

export const getWallet = async (): Promise<Wallet> => {
  await delay(WALLET_DELAY_MS)
  if (spinWalletFetchOutcome() === "error") {
    throw new Error("WALLET_FETCH_ERROR")
  }
  return { balance: state.balance, movements: state.movements.slice() }
}

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)

export const formatTimestamp = (iso: string): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(iso))
