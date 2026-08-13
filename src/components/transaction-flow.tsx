"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type ChangeEvent, type SyntheticEvent } from "react"
import { useForm, useWatch } from "react-hook-form"

import { MOCK_BALANCE, MOCK_FAVORITES } from "@/domain/mocks"
import {
  sanitizeAmount,
  transactionFormSchema,
  type TransactionFormValues,
} from "@/domain/transaction"
import {
  formatCurrency,
  getWallet,
  recordTransaction,
  WALLET_QUERY_KEY,
} from "@/domain/wallet"
import { postTransaction, WalletApiError } from "@/lib/api"

import { ScreenShell } from "./screen-shell"
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
  const [step, setStep] = useState<Step>("capture")
  const [draft, setDraft] = useState<Draft | null>(null)
  const walletQuery = useQuery({
    queryKey: WALLET_QUERY_KEY,
    queryFn: getWallet,
  })
  const balance = walletQuery.data?.balance ?? MOCK_BALANCE
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema(balance)),
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
      recordTransaction({
        id: data.receiptId,
        description: `Sent to ${draft.recipientLabel}`,
        amount: -draft.amount,
        timestamp: data.timestamp,
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
          <h1 className="text-2xl font-semibold tracking-tight">
            Confirm transaction
          </h1>
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
            <p className="text-sm text-muted">You are sending</p>
            <p className="text-3xl font-semibold">
              {formatCurrency(draft.amount)}
            </p>
            <p className="text-sm text-muted">To {draft.recipientLabel}</p>
          </div>
          {Boolean(mutation.isError) && (
            <p className="text-sm text-danger" role="alert">
              {mutation.error instanceof WalletApiError
                ? `${mutation.error.code}: ${mutation.error.message}`
                : "Unexpected error."}
            </p>
          )}
          <Button onClick={send} disabled={mutation.isPending}>
            {mutation.isPending
              ? "Sending..."
              : mutation.isError
                ? "Retry"
                : "Send"}
          </Button>
          <Button
            variant="secondary"
            onClick={handleBackToEdit}
            disabled={mutation.isPending}
          >
            Edit
          </Button>
        </div>
      </ScreenShell>
    )
  }

  return (
    <ScreenShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <Link href="/" className="text-sm text-primary">
            Back
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            New transaction
          </h1>
          <p className="text-sm text-muted">
            Available {formatCurrency(balance)}
          </p>
        </div>
        <form
          className="flex flex-col gap-5"
          onSubmit={handleCaptureSubmit}
          noValidate
        >
          <Input
            id="amount"
            label="Amount"
            inputMode="decimal"
            autoComplete="transaction-amount"
            error={errors.amount?.message}
            {...amountField}
            onChange={handleAmountChange}
          />
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">Favorites</legend>
            <div className="flex flex-col gap-2">
              {MOCK_FAVORITES.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => selectFavorite(contact.id)}
                  className={`rounded-xl border px-4 py-3 text-left ${selectedId === contact.id ? "border-primary bg-card" : "border-border bg-card"}`}
                >
                  <span className="block text-sm font-medium">
                    {contact.name}
                  </span>
                  <span className="block text-xs text-muted">
                    {contact.identifier}
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
            label="New contact"
            placeholder="Phone or email"
            autoComplete="username"
            error={errors.newContact?.message}
            {...newContactField}
            onChange={handleNewContactChange}
          />
          <Button type="submit">Continue</Button>
        </form>
      </div>
    </ScreenShell>
  )
}
