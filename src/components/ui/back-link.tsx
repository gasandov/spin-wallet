import { faChevronLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"

type BackLinkProps = {
  href: string
  label: string
}

export const BackLink = ({ href, label }: BackLinkProps) => (
  <Link
    href={href}
    className="inline-flex items-center gap-2 text-sm text-accent"
  >
    <FontAwesomeIcon icon={faChevronLeft} className="fa-fw h-4 w-4" />
    {label}
  </Link>
)
