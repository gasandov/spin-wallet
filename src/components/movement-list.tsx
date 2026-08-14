import {
  faArrowDown,
  faArrowUp,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
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
          className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <FontAwesomeIcon
              icon={movement.amount < 0 ? faArrowUp : faArrowDown}
              className={`fa-fw h-4 w-4 shrink-0 ${movement.amount < 0 ? "text-danger" : "text-success"}`}
            />
            <div className="flex min-w-0 flex-col">
              <span className="text-sm font-medium">
                {movement.description}
              </span>
              <span className="text-xs text-muted">
                {formatTimestamp(movement.timestamp)}
              </span>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2">
            <span
              className={`text-sm font-medium ${movement.amount < 0 ? "text-danger" : "text-success"}`}
            >
              {formatCurrency(movement.amount)}
            </span>
            <FontAwesomeIcon
              icon={faChevronRight}
              className="fa-fw h-4 w-4 text-muted"
            />
          </span>
        </Link>
      </li>
    ))}
  </ul>
)
