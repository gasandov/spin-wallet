"use client"

import { faWallet } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useRouter } from "next/navigation"

import { LoginForm } from "@/components/login-form"
import { ScreenShell } from "@/components/screen-shell"
import { useSessionStore } from "@/store/session"

const LoginPage = () => {
  const router = useRouter()
  const login = useSessionStore((state) => state.login)

  const handleLogin = (identifier: string, displayName: string) => {
    login(identifier, displayName)
    router.push("/")
  }

  return (
    <ScreenShell>
      <div className="flex flex-1 flex-col justify-center gap-8">
        <div className="flex flex-col gap-2">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            <FontAwesomeIcon icon={faWallet} className="fa-fw h-4 w-4" />
            Spin Wallet
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-accent">
            Sign in
          </h1>
          <p className="text-sm text-muted">
            Use your phone number or email to continue.
          </p>
        </div>
        <LoginForm onLogin={handleLogin} />
      </div>
    </ScreenShell>
  )
}

export default LoginPage
