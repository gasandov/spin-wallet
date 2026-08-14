"use client"

import { faRightToBracket } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, type SyntheticEvent } from "react"
import { useForm } from "react-hook-form"

import {
  LOGIN_FAIL_EMAIL,
  LOGIN_FAIL_PHONE,
  loginFormSchema,
  type LoginFormValues,
} from "@/domain/auth"
import type { Session } from "@/domain/wallet.types"
import { postLogin } from "@/lib/api"

import { Button } from "./ui/button"
import { Input } from "./ui/input"

type LoginFormProps = {
  onLogin: (identifier: string, displayName: string) => void
  signIn?: (identifier: string) => Promise<Session>
}

export const LoginForm = ({ onLogin, signIn = postLogin }: LoginFormProps) => {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { identifier: "" },
  })
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { errors, isSubmitting } = form.formState

  const submit = async ({ identifier }: LoginFormValues) => {
    setSubmitError(null)
    try {
      const session = await signIn(identifier)
      onLogin(session.identifier, session.displayName)
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again."
      setSubmitError(message)
    }
  }

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    form.handleSubmit(submit)(event)
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <Input
        id="identifier"
        label="Phone or email"
        autoComplete="username"
        inputMode="email"
        error={errors.identifier?.message}
        {...form.register("identifier")}
      />
      <p className="text-xs text-muted">
        To see an auth error, use {LOGIN_FAIL_EMAIL} or {LOGIN_FAIL_PHONE}.
      </p>
      {Boolean(submitError) && (
        <p className="text-sm text-danger" role="alert">
          {submitError}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting}>
        <FontAwesomeIcon icon={faRightToBracket} className="fa-fw h-4 w-4" />
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  )
}
