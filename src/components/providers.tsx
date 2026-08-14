"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { useEffect, useState, type ReactNode } from "react"

import { makeQueryClient } from "@/lib/query-client"
import { useLocaleStore } from "@/store/locale"

type ProvidersProps = {
  children: ReactNode
}

export const Providers = ({ children }: ProvidersProps) => {
  const [queryClient] = useState(makeQueryClient)

  useEffect(() => {
    useLocaleStore.getState().hydrate()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
