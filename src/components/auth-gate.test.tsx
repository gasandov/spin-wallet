import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { StrictMode } from "react"

import { dictionaries } from "@/i18n/messages"
import { getSession } from "@/lib/api"
import { useLocaleStore } from "@/store/locale"
import { useSessionStore } from "@/store/session"

import { AuthGate } from "./auth-gate"

const replace = vi.fn()
const usePathname = vi.fn()

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
  useRouter: () => ({ replace }),
}))

vi.mock("@/lib/api", () => ({
  getSession: vi.fn(),
}))

describe("AuthGate", () => {
  beforeEach(() => {
    replace.mockReset()
    vi.mocked(getSession).mockReset()
    usePathname.mockReset()
    useSessionStore.setState({
      identifier: null,
      displayName: null,
      hasHydrated: false,
    })
    useLocaleStore.setState({
      locale: "es",
      messages: dictionaries.es,
    })
  })

  it("does not check the session on the public login page", async () => {
    usePathname.mockReturnValue("/login")

    render(
      <AuthGate>
        <p>login</p>
      </AuthGate>,
    )

    expect(await screen.findByText("login")).toBeInTheDocument()
    expect(getSession).not.toHaveBeenCalled()
  })

  it("redirects unauthenticated protected routes without surfacing an error", async () => {
    usePathname.mockReturnValue("/")
    vi.mocked(getSession).mockResolvedValue(null)

    render(
      <AuthGate>
        <p>wallet</p>
      </AuthGate>,
    )

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"))
    expect(screen.queryByText("wallet")).not.toBeInTheDocument()
  })

  it("loads a valid session once and renders the protected route", async () => {
    usePathname.mockReturnValue("/")
    vi.mocked(getSession).mockResolvedValue({
      identifier: "ana@spin.app",
      displayName: "ana",
    })

    render(
      <StrictMode>
        <AuthGate>
          <p>wallet</p>
        </AuthGate>
      </StrictMode>,
    )

    expect(await screen.findByText("wallet")).toBeInTheDocument()
    expect(getSession).toHaveBeenCalledTimes(1)
    expect(useSessionStore.getState().displayName).toBe("ana")
  })

  it("redirects a known session away from login", async () => {
    usePathname.mockReturnValue("/login")
    useSessionStore.setState({
      identifier: "ana@spin.app",
      displayName: "ana",
      hasHydrated: false,
    })

    render(
      <AuthGate>
        <p>login</p>
      </AuthGate>,
    )

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"))
    expect(getSession).not.toHaveBeenCalled()
  })
})
