import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { LoginForm } from "./login-form"

describe("LoginForm", () => {
  it("shows a validation error when submitted empty", async () => {
    render(<LoginForm onLogin={vi.fn()} />)
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }))
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Phone or email is required.",
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
    fireEvent.change(screen.getByLabelText("Phone or email"), {
      target: { value: "fail@spin.app" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }))
    expect(
      await screen.findByText("Unable to sign in. Please try again."),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(onLogin).not.toHaveBeenCalled()
    })
  })

  it("shows the reserved credentials that reproduce an auth error", () => {
    render(<LoginForm onLogin={vi.fn()} />)
    expect(screen.getByText(/fail@spin.app/)).toBeInTheDocument()
    expect(screen.getByText(/0000000000/)).toBeInTheDocument()
  })
})
