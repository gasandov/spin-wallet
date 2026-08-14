"use client"

import { faReceipt } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useQuery } from "@tanstack/react-query"
import { use } from "react"

import { ScreenShell } from "@/components/screen-shell"
import { BackLink } from "@/components/ui/back-link"
import { formatCurrency, formatTimestamp } from "@/domain/wallet"
import { getMovement } from "@/lib/api"

type ReceiptPageProps = {
  params: Promise<{ id: string }>
}

const ReceiptPage = ({ params }: ReceiptPageProps) => {
  const { id } = use(params)
  const movementQuery = useQuery({
    queryKey: ["movement", id],
    queryFn: () => getMovement(id),
  })

  if (movementQuery.isPending) {
    return (
      <ScreenShell>
        <p role="status" className="text-sm text-muted">
          Loading...
        </p>
      </ScreenShell>
    )
  }

  const movement = movementQuery.data
  if (!movement) {
    return (
      <ScreenShell>
        <div className="flex flex-col gap-4">
          <BackLink href="/" />
          <h1 className="text-2xl font-semibold tracking-tight text-accent">
            Transaction not found
          </h1>
        </div>
      </ScreenShell>
    )
  }

  return (
    <ScreenShell>
      <BackLink href="/" />
      <div className="flex flex-col mt-2 gap-6">
        <h1 className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight text-accent">
          <FontAwesomeIcon icon={faReceipt} className="fa-fw h-6 w-6" />
          Receipt
        </h1>
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
          <p>
            <span className="text-muted">Receipt ID</span>
            <br />
            <span className="font-medium">{movement.id}</span>
          </p>
          <p>
            <span className="text-muted">Description</span>
            <br />
            <span className="font-medium">{movement.description}</span>
          </p>
          <p>
            <span className="text-muted">Amount</span>
            <br />
            <span className="font-medium">
              {formatCurrency(movement.amount)}
            </span>
          </p>
          <p>
            <span className="text-muted">Time</span>
            <br />
            <span className="font-medium">
              {formatTimestamp(movement.timestamp)}
            </span>
          </p>
        </div>
      </div>
    </ScreenShell>
  )
}

export default ReceiptPage
