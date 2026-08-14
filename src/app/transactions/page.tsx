"use client"

import { useQuery } from "@tanstack/react-query"

import { MovementList } from "@/components/movement-list"
import { ScreenShell } from "@/components/screen-shell"
import { BackLink } from "@/components/ui/back-link"
import { Button } from "@/components/ui/button"
import { WALLET_QUERY_KEY } from "@/domain/wallet"
import { getWallet } from "@/lib/api"
import { useLocaleStore } from "@/store/locale"

const TransactionsPage = () => {
  const locale = useLocaleStore((state) => state.locale)
  const messages = useLocaleStore((state) => state.messages)
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
          <BackLink href="/" label={messages.common.back} />
          <h1 className="text-2xl font-semibold tracking-tight text-accent">
            {messages.receipts.allTransactions}
          </h1>
        </div>

        {Boolean(walletQuery.isPending) && (
          <div className="flex flex-col gap-2" role="status">
            <div className="h-16 animate-pulse rounded-xl bg-card" />
            <div className="h-16 animate-pulse rounded-xl bg-card" />
            <p className="sr-only">{messages.receipts.loadingTransactions}</p>
          </div>
        )}

        {Boolean(walletQuery.isError) && (
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
            <p className="text-sm text-danger" role="alert">
              {messages.home.walletLoadError}
            </p>
            <Button onClick={handleRetry} variant="secondary">
              {messages.common.retry}
            </Button>
          </div>
        )}

        {Boolean(walletQuery.data) && walletQuery.data && (
          <>
            {walletQuery.data.movements.length === 0 ? (
              <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted">
                {messages.receipts.noTransactions}
              </p>
            ) : (
              <MovementList
                movements={walletQuery.data.movements}
                locale={locale}
              />
            )}
          </>
        )}
      </div>
    </ScreenShell>
  )
}

export default TransactionsPage
