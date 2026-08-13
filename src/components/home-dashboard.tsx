"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  formatCurrency,
  getWallet,
  RECENT_MOVEMENT_COUNT,
  resetWallet,
  WALLET_QUERY_KEY,
} from "@/domain/wallet"
import { useSessionStore } from "@/store/session"

import { MovementList } from "./movement-list"
import { ScreenShell } from "./screen-shell"
import { Button } from "./ui/button"

export const HomeDashboard = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const displayName = useSessionStore((state) => state.displayName)
  const logout = useSessionStore((state) => state.logout)
  const walletQuery = useQuery({
    queryKey: WALLET_QUERY_KEY,
    queryFn: getWallet,
  })

  const goToTransaction = () => {
    router.push("/transaction")
  }

  const retry = async () => {
    await walletQuery.refetch()
  }

  const handleRetry = () => {
    retry()
  }

  const signOut = () => {
    logout()
    resetWallet()
    queryClient.clear()
    router.replace("/login")
  }

  const recent =
    walletQuery.data?.movements.slice(0, RECENT_MOVEMENT_COUNT) ?? []

  return (
    <ScreenShell>
      <header className="mb-6 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted">Welcome back</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {displayName ?? "Spin User"}
          </h1>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="shrink-0 text-sm text-primary"
        >
          Sign out
        </button>
      </header>

      {Boolean(walletQuery.isPending) && (
        <div className="flex flex-col gap-4" role="status">
          <div className="h-36 animate-pulse rounded-2xl bg-card" />
          <div className="h-16 animate-pulse rounded-xl bg-card" />
          <div className="h-16 animate-pulse rounded-xl bg-card" />
          <p className="sr-only">Loading wallet</p>
        </div>
      )}

      {Boolean(walletQuery.isError) && (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
          <p className="text-sm text-danger" role="alert">
            Could not load your wallet. Please try again.
          </p>
          <Button onClick={handleRetry} variant="secondary">
            Retry
          </Button>
        </div>
      )}

      {Boolean(walletQuery.data) && walletQuery.data && (
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl bg-primary p-5 text-primary-foreground">
            <p className="text-sm opacity-80">Available balance</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {formatCurrency(walletQuery.data.balance)}
            </p>
          </section>

          <Button onClick={goToTransaction}>New transaction</Button>

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium text-muted">
                Recent movements
              </h2>
              <Link href="/transactions" className="text-sm text-primary">
                See all
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted">
                No recent movements.
              </p>
            ) : (
              <MovementList movements={recent} />
            )}
          </section>
        </div>
      )}
    </ScreenShell>
  )
}
