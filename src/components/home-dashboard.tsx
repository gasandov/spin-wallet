"use client"

import {
  faChevronRight,
  faPaperPlane,
  faRightFromBracket,
  faWallet,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  formatCurrency,
  RECENT_MOVEMENT_COUNT,
  WALLET_QUERY_KEY,
} from "@/domain/wallet"
import { getWallet, postLogout } from "@/lib/api"
import { useLocaleStore } from "@/store/locale"
import { useSessionStore } from "@/store/session"

import { MovementList } from "./movement-list"
import { ScreenShell } from "./screen-shell"
import { Button } from "./ui/button"

export const HomeDashboard = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const displayName = useSessionStore((state) => state.displayName)
  const logout = useSessionStore((state) => state.logout)
  const locale = useLocaleStore((state) => state.locale)
  const messages = useLocaleStore((state) => state.messages)
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

  const signOutUser = async () => {
    try {
      await postLogout()
    } catch {
      // cookie may already be gone; still clear local UI state
    }
    logout()
    queryClient.clear()
    router.replace("/login")
  }

  const signOut = () => {
    signOutUser()
  }

  const recent =
    walletQuery.data?.movements.slice(0, RECENT_MOVEMENT_COUNT) ?? []

  return (
    <ScreenShell>
      <header className="mb-6 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted">{messages.home.welcomeBack}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-accent">
            {displayName ?? messages.home.spinUser}
          </h1>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="inline-flex shrink-0 items-center gap-2 text-sm text-accent cursor-pointer"
        >
          <FontAwesomeIcon
            icon={faRightFromBracket}
            className="fa-fw h-4 w-4"
          />
          {messages.home.signOut}
        </button>
      </header>

      {Boolean(walletQuery.isPending) && (
        <div className="flex flex-col gap-4" role="status">
          <div className="h-36 animate-pulse rounded-2xl bg-card" />
          <div className="h-16 animate-pulse rounded-xl bg-card" />
          <div className="h-16 animate-pulse rounded-xl bg-card" />
          <p className="sr-only">{messages.home.loadingWallet}</p>
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
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl bg-primary p-5 text-primary-foreground">
            <p className="inline-flex items-center gap-2 text-sm opacity-80">
              <FontAwesomeIcon icon={faWallet} className="fa-fw h-4 w-4" />
              {messages.home.availableBalance}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {formatCurrency(walletQuery.data.balance, locale)}
            </p>
          </section>

          <Button onClick={goToTransaction}>
            <FontAwesomeIcon icon={faPaperPlane} className="fa-fw h-4 w-4" />
            {messages.home.newTransaction}
          </Button>

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium text-muted">
                {messages.home.recentMovements}
              </h2>
              <Link
                href="/transactions"
                className="inline-flex items-center gap-2 text-sm text-accent"
              >
                {messages.home.seeAll}
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="fa-fw h-4 w-4"
                />
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted">
                {messages.home.noRecentMovements}
              </p>
            ) : (
              <MovementList movements={recent} locale={locale} />
            )}
          </section>
        </div>
      )}
    </ScreenShell>
  )
}
