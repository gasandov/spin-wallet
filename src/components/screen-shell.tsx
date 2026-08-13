import type { ReactNode } from "react"

type ScreenShellProps = {
  children: ReactNode
}

export const ScreenShell = ({ children }: ScreenShellProps) => (
  <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6">
    {children}
  </div>
)
