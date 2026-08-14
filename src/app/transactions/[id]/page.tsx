"use client"

import { faReceipt } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useQuery } from "@tanstack/react-query"
import { use } from "react"

import { ScreenShell } from "@/components/screen-shell"
import { BackLink } from "@/components/ui/back-link"
import { formatCurrency, formatTimestamp } from "@/domain/wallet"
import { getMovement } from "@/lib/api"
import { useLocaleStore } from "@/store/locale"

type ReceiptPageProps = {
  params: Promise<{ id: string }>
}

const ReceiptPage = ({ params }: ReceiptPageProps) => {
  const { id } = use(params)
  const locale = useLocaleStore((state) => state.locale)
  const messages = useLocaleStore((state) => state.messages)
  const movementQuery = useQuery({
    queryKey: ["movement", id],
    queryFn: () => getMovement(id),
  })

  if (movementQuery.isPending) {
    return (
      <ScreenShell>
        <p role="status" className="text-sm text-muted">
          {messages.common.loading}
        </p>
      </ScreenShell>
    )
  }

  const movement = movementQuery.data
  if (!movement) {
    return (
      <ScreenShell>
        <div className="flex flex-col gap-4">
          <BackLink href="/" label={messages.common.back} />
          <h1 className="text-2xl font-semibold tracking-tight text-accent">
            {messages.receipts.notFound}
          </h1>
        </div>
      </ScreenShell>
    )
  }

  return (
    <ScreenShell>
      <BackLink href="/" label={messages.common.back} />
      <div className="flex flex-col mt-2 gap-6">
        <h1 className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight text-accent">
          <FontAwesomeIcon icon={faReceipt} className="fa-fw h-6 w-6" />
          {messages.receipts.receipt}
        </h1>
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
          <p>
            <span className="text-muted">{messages.receipts.receiptId}</span>
            <br />
            <span className="font-medium">{movement.id}</span>
          </p>
          <p>
            <span className="text-muted">{messages.receipts.description}</span>
            <br />
            <span className="font-medium">{movement.description}</span>
          </p>
          <p>
            <span className="text-muted">{messages.receipts.amount}</span>
            <br />
            <span className="font-medium">
              {formatCurrency(movement.amount, locale)}
            </span>
          </p>
          <p>
            <span className="text-muted">{messages.receipts.time}</span>
            <br />
            <span className="font-medium">
              {formatTimestamp(movement.timestamp, locale)}
            </span>
          </p>
        </div>
      </div>
    </ScreenShell>
  )
}

export default ReceiptPage
