export const WALLET_QUERY_KEY = ["wallet"] as const
export const WALLET_DELAY_MS = 400
export const WALLET_FETCH_FAIL_RATE = 0.2
export const RECENT_MOVEMENT_COUNT = 5

export const spinWalletFetchOutcome = (
  random: () => number = Math.random,
): "error" | "success" =>
  random() < WALLET_FETCH_FAIL_RATE ? "error" : "success"

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
