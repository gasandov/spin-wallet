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
import { interpolate, messageForErrorCode } from "@/i18n/messages"
import { postLogin, WalletApiError } from "@/lib/api"
import { useLocaleStore } from "@/store/locale"

import { Button } from "./ui/button"
import { Input } from "./ui/input"

type LoginFormProps = {
  onLogin: (identifier: string, displayName: string) => void
  signIn?: (identifier: string) => Promise<Session>
}

export const LoginForm = ({ onLogin, signIn = postLogin }: LoginFormProps) => {
  const messages = useLocaleStore((state) => state.messages)
  const form = useForm<LoginFormValues>({
    resolver: (values, context, options) =>
      zodResolver(
        loginFormSchema(useLocaleStore.getState().messages.validation.login),
      )(values, context, options),
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
      if (err instanceof WalletApiError) {
        setSubmitError(messageForErrorCode(err.code, messages))
        return
      }
      setSubmitError(messages.auth.signInFailed)
    }
  }

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    form.handleSubmit(submit)(event)
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <Input
        id="identifier"
        label={messages.auth.identifierLabel}
        autoComplete="username"
        inputMode="email"
        error={errors.identifier?.message}
        {...form.register("identifier")}
      />
      <p className="text-xs text-muted">
        {interpolate(messages.auth.failHint, {
          email: LOGIN_FAIL_EMAIL,
          phone: LOGIN_FAIL_PHONE,
        })}
      </p>
      {Boolean(submitError) && (
        <p className="text-sm text-danger" role="alert">
          {submitError}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting}>
        <FontAwesomeIcon icon={faRightToBracket} className="fa-fw h-4 w-4" />
        {isSubmitting ? messages.auth.signingIn : messages.auth.signIn}
      </Button>
    </form>
  )
}
