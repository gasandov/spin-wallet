import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { dictionaries, en, es } from "@/i18n/messages"
import { useLocaleStore } from "@/store/locale"

import { LoginForm } from "./login-form"

describe("LoginForm", () => {
  beforeEach(() => {
    localStorage.clear()
    useLocaleStore.setState({
      locale: "es",
      messages: dictionaries.es,
    })
  })

  it("shows a validation error when submitted empty", async () => {
    render(<LoginForm onLogin={vi.fn()} />)
    fireEvent.click(screen.getByRole("button", { name: es.auth.signIn }))
    expect(await screen.findByRole("alert")).toHaveTextContent(
      es.validation.login.identifierRequired,
    )
  })

  it("shows the mock error for fail@spin.app", async () => {
    const signIn = vi.fn(async (identifier: string) => {
      if (identifier === "fail@spin.app") {
        throw new Error("Unable to sign in. Please try again.")
      }
      return { identifier, displayName: "user" }
    })
    const onLogin = vi.fn()
    render(<LoginForm onLogin={onLogin} signIn={signIn} />)
    fireEvent.change(screen.getByLabelText(es.auth.identifierLabel), {
      target: { value: "fail@spin.app" },
    })
    fireEvent.click(screen.getByRole("button", { name: es.auth.signIn }))
    expect(await screen.findByText(es.auth.signInFailed)).toBeInTheDocument()
    await waitFor(() => {
      expect(onLogin).not.toHaveBeenCalled()
    })
  })

  it("shows the reserved credentials that reproduce an auth error", () => {
    render(<LoginForm onLogin={vi.fn()} />)
    expect(screen.getByText(/fail@spin.app/)).toBeInTheDocument()
    expect(screen.getByText(/0000000000/)).toBeInTheDocument()
  })

  it("shows English labels after switching locale", () => {
    useLocaleStore.getState().setLocale("en")
    render(<LoginForm onLogin={vi.fn()} />)
    expect(
      screen.getByRole("button", { name: en.auth.signIn }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(en.auth.identifierLabel)).toBeInTheDocument()
  })
})
