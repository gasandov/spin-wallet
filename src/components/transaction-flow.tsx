"use client"

import {
  faArrowRight,
  faPaperPlane,
  faPen,
  faStar,
  faUser,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState, type ChangeEvent, type SyntheticEvent } from "react"
import { useForm, useWatch } from "react-hook-form"

import { MOCK_BALANCE, MOCK_FAVORITES } from "@/domain/mocks"
import {
  sanitizeAmount,
  transactionFormSchema,
  type TransactionFormValues,
} from "@/domain/transaction"
import { formatCurrency, WALLET_QUERY_KEY } from "@/domain/wallet"
import { interpolate, messageForErrorCode } from "@/i18n/messages"
import { getWallet, postTransaction, WalletApiError } from "@/lib/api"
import { useLocaleStore } from "@/store/locale"

import { ScreenShell } from "./screen-shell"
import { BackLink } from "./ui/back-link"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

type Step = "capture" | "confirm"

type Draft = {
  amount: number
  contactId: string
  recipientLabel: string
}

const recipientLabel = (
  contactId: string,
  newContact: string,
): { contactId: string; recipientLabel: string } => {
  const trimmed = newContact.trim()
  if (trimmed.length > 0) {
    return { contactId: `new:${trimmed}`, recipientLabel: trimmed }
  }
  const favorite = MOCK_FAVORITES.find((contact) => contact.id === contactId)
  return {
    contactId,
    recipientLabel: favorite ? favorite.name : contactId,
  }
}

export const TransactionFlow = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const locale = useLocaleStore((state) => state.locale)
  const messages = useLocaleStore((state) => state.messages)
  const [step, setStep] = useState<Step>("capture")
  const [draft, setDraft] = useState<Draft | null>(null)
  const walletQuery = useQuery({
    queryKey: WALLET_QUERY_KEY,
    queryFn: getWallet,
  })
  const balance = walletQuery.data?.balance ?? MOCK_BALANCE
  const form = useForm<TransactionFormValues>({
    resolver: (values, context, options) =>
      zodResolver(
        transactionFormSchema(
          balance,
          useLocaleStore.getState().messages.validation.transaction,
        ),
      )(values, context, options),
    defaultValues: { amount: "", contactId: "", newContact: "" },
  })
  const selectedId = useWatch({ control: form.control, name: "contactId" })
  const { errors } = form.formState
  const amountField = form.register("amount")
  const newContactField = form.register("newContact")

  const mutation = useMutation({
    mutationFn: postTransaction,
    retry: false,
  })

  const submitCapture = (values: TransactionFormValues) => {
    const recipient = recipientLabel(values.contactId, values.newContact)
    setDraft({
      amount: Number(values.amount),
      contactId: recipient.contactId,
      recipientLabel: recipient.recipientLabel,
    })
    setStep("confirm")
  }

  const handleCaptureSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    form.handleSubmit(submitCapture)(event)
  }

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.target.value = sanitizeAmount(event.target.value)
    amountField.onChange(event)
  }

  const selectFavorite = (contactId: string) => {
    form.setValue("contactId", contactId)
    form.setValue("newContact", "")
    form.clearErrors(["contactId", "newContact"])
  }

  const handleNewContactChange = (event: ChangeEvent<HTMLInputElement>) => {
    form.setValue("contactId", "")
    form.clearErrors(["contactId", "newContact"])
    newContactField.onChange(event)
  }

  const handleBackToEdit = () => {
    mutation.reset()
    setStep("capture")
  }

  const sendTransaction = async () => {
    if (!draft) return
    try {
      const data = await mutation.mutateAsync({
        amount: draft.amount,
        contactId: draft.contactId,
      })
      await queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY })
      router.replace(`/transactions/${data.receiptId}`)
    } catch {
      // mutation.error is rendered on the confirm step
    }
  }

  const send = () => {
    sendTransaction()
  }

  if (step === "confirm" && draft) {
    return (
      <ScreenShell>
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl font-semibold tracking-tight text-accent">
            {messages.transaction.confirmTitle}
          </h1>
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
            <p className="text-sm text-muted">
              {messages.transaction.youAreSending}
            </p>
            <p className="text-3xl font-semibold">
              {formatCurrency(draft.amount, locale)}
            </p>
            <p className="text-sm text-muted">
              {interpolate(messages.transaction.toRecipient, {
                name: draft.recipientLabel,
              })}
            </p>
          </div>
          {Boolean(mutation.isError) && (
            <p className="text-sm text-danger" role="alert">
              {mutation.error instanceof WalletApiError
                ? messageForErrorCode(mutation.error.code, messages)
                : messages.errors.UNKNOWN_ERROR}
            </p>
          )}
          <div className="flex flex-col md:flex-row-reverse gap-2">
            <Button onClick={send} disabled={mutation.isPending}>
              <FontAwesomeIcon icon={faPaperPlane} className="fa-fw h-4 w-4" />
              {mutation.isPending
                ? messages.transaction.sending
                : mutation.isError
                  ? messages.common.retry
                  : messages.transaction.send}
            </Button>
            <Button
              variant="secondary"
              onClick={handleBackToEdit}
              disabled={mutation.isPending}
            >
              <FontAwesomeIcon icon={faPen} className="fa-fw h-4 w-4" />
              {messages.transaction.edit}
            </Button>
          </div>
        </div>
      </ScreenShell>
    )
  }

  return (
    <ScreenShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <BackLink href="/" label={messages.common.back} />
          <h1 className="text-2xl font-semibold tracking-tight text-accent">
            {messages.transaction.title}
          </h1>
          <p className="text-sm text-muted">
            {interpolate(messages.transaction.available, {
              amount: formatCurrency(balance, locale),
            })}
          </p>
        </div>
        <form
          className="flex flex-col gap-5"
          onSubmit={handleCaptureSubmit}
          noValidate
        >
          <Input
            id="amount"
            label={messages.transaction.amount}
            inputMode="decimal"
            autoComplete="transaction-amount"
            error={errors.amount?.message}
            {...amountField}
            onChange={handleAmountChange}
          />
          <fieldset className="flex flex-col gap-2">
            <legend className="inline-flex items-center gap-2 text-sm font-medium">
              <FontAwesomeIcon icon={faStar} className="fa-fw h-4 w-4" />
              {messages.transaction.favorites}
            </legend>
            <div className="flex flex-col gap-2">
              {MOCK_FAVORITES.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => selectFavorite(contact.id)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left ${selectedId === contact.id ? "border-accent bg-card" : "border-border bg-card"}`}
                >
                  <FontAwesomeIcon
                    icon={faUser}
                    className="fa-fw h-4 w-4 text-muted"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">
                      {contact.name}
                    </span>
                    <span className="block text-xs text-muted">
                      {contact.identifier}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            {Boolean(errors.contactId) && (
              <p className="text-sm text-danger" role="alert">
                {errors.contactId?.message}
              </p>
            )}
          </fieldset>
          <Input
            id="newContact"
            label={
              <>
                <FontAwesomeIcon icon={faUserPlus} className="fa-fw h-4 w-4" />
                {messages.transaction.newContact}
              </>
            }
            placeholder={messages.transaction.identifierPlaceholder}
            autoComplete="username"
            error={errors.newContact?.message}
            {...newContactField}
            onChange={handleNewContactChange}
          />
          <Button type="submit">
            <FontAwesomeIcon icon={faArrowRight} className="fa-fw h-4 w-4" />
            {messages.transaction.continue}
          </Button>
        </form>
      </div>
    </ScreenShell>
  )
}
