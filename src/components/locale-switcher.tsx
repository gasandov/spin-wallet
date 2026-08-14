"use client"

import type { Locale } from "@/i18n/messages"
import { useLocaleStore } from "@/store/locale"

const OPTIONS: { locale: Locale; label: string }[] = [
  { locale: "es", label: "Español" },
  { locale: "en", label: "English" },
]

export const LocaleSwitcher = () => {
  const locale = useLocaleStore((state) => state.locale)
  const messages = useLocaleStore((state) => state.messages)
  const setLocale = useLocaleStore((state) => state.setLocale)

  return (
    <div
      role="group"
      aria-label={messages.common.language}
      className="inline-flex items-center gap-1"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.locale}
          type="button"
          aria-pressed={locale === option.locale}
          onClick={() => setLocale(option.locale)}
          className={`rounded-lg px-2 py-1 text-sm cursor-pointer ${locale === option.locale ? "font-medium text-accent" : "text-muted"}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
