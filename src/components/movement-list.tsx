import Link from "next/link"

import { formatCurrency, formatTimestamp } from "@/domain/wallet"
import type { Movement } from "@/domain/wallet.types"

type MovementListProps = {
  movements: Movement[]
}

export const MovementList = ({ movements }: MovementListProps) => (
  <ul className="flex flex-col gap-2">
    {movements.map((movement) => (
      <li key={movement.id}>
        <Link
          href={`/transactions/${movement.id}`}
          className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
        >
          <div className="flex flex-col">
            <span className="text-sm font-medium">{movement.description}</span>
            <span className="text-xs text-muted">
              {formatTimestamp(movement.timestamp)}
            </span>
          </div>
          <span
            className={`text-sm font-medium ${movement.amount < 0 ? "text-danger" : "text-success"}`}
          >
            {formatCurrency(movement.amount)}
          </span>
        </Link>
      </li>
    ))}
  </ul>
)
