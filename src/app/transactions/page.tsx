"use client"

import { useQuery } from "@tanstack/react-query"

import { MovementList } from "@/components/movement-list"
import { ScreenShell } from "@/components/screen-shell"
import { BackLink } from "@/components/ui/back-link"
import { Button } from "@/components/ui/button"
import { WALLET_QUERY_KEY } from "@/domain/wallet"
import { getWallet } from "@/lib/api"

const TransactionsPage = () => {
  const walletQuery = useQuery({
    queryKey: WALLET_QUERY_KEY,
    queryFn: getWallet,
  })

  const retry = async () => {
    await walletQuery.refetch()
  }

  const handleRetry = () => {
    retry()
  }

  return (
    <ScreenShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <BackLink href="/" />
          <h1 className="text-2xl font-semibold tracking-tight text-accent">
            All transactions
          </h1>
        </div>

        {Boolean(walletQuery.isPending) && (
          <div className="flex flex-col gap-2" role="status">
            <div className="h-16 animate-pulse rounded-xl bg-card" />
            <div className="h-16 animate-pulse rounded-xl bg-card" />
            <p className="sr-only">Loading transactions</p>
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
          <>
            {walletQuery.data.movements.length === 0 ? (
              <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted">
                No transactions.
              </p>
            ) : (
              <MovementList movements={walletQuery.data.movements} />
            )}
          </>
        )}
      </div>
    </ScreenShell>
  )
}

export default TransactionsPage
