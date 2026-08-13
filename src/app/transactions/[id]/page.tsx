"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { use } from "react"

import { ScreenShell } from "@/components/screen-shell"
import { formatCurrency, formatTimestamp, getMovement } from "@/domain/wallet"

type ReceiptPageProps = {
  params: Promise<{ id: string }>
}

const ReceiptPage = ({ params }: ReceiptPageProps) => {
  const { id } = use(params)
  const movementQuery = useQuery({
    queryKey: ["movement", id],
    queryFn: () => getMovement(id) ?? null,
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
          <Link href="/transactions" className="text-sm text-primary">
            Back
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            Transaction not found
          </h1>
        </div>
      </ScreenShell>
    )
  }

  return (
    <ScreenShell>
      <div className="flex flex-1 flex-col justify-center gap-6">
        <Link href="/transactions" className="text-sm text-primary">
          Back
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Receipt</h1>
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
        <Link
          href="/"
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Back to home
        </Link>
      </div>
    </ScreenShell>
  )
}

export default ReceiptPage
