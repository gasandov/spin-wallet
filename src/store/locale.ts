import { create } from "zustand"

import {
  DEFAULT_LOCALE,
  dictionaries,
  isLocale,
  type Locale,
  type Messages,
} from "@/i18n/messages"

const STORAGE_KEY = "spin_locale"

const applyHtmlLang = (locale: Locale) => {
  document.documentElement.lang = locale
}

type LocaleState = {
  locale: Locale
  messages: Messages
  setLocale: (locale: Locale) => void
  hydrate: () => void
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: DEFAULT_LOCALE,
  messages: dictionaries[DEFAULT_LOCALE],
  setLocale: (locale) => {
    localStorage.setItem(STORAGE_KEY, locale)
    applyHtmlLang(locale)
    set({ locale, messages: dictionaries[locale] })
  },
  hydrate: () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!isLocale(stored)) return
    applyHtmlLang(stored)
    set({ locale: stored, messages: dictionaries[stored] })
  },
}))
