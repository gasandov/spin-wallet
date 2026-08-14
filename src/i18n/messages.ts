export type Locale = "es" | "en"

export const DEFAULT_LOCALE: Locale = "es"

export const intlTags: Record<Locale, string> = {
  es: "es",
  en: "en-US",
}

export const en = {
  common: {
    loading: "Loading...",
    back: "Back",
    retry: "Retry",
    language: "Language",
  },
  auth: {
    brand: "Spin Wallet",
    signIn: "Sign in",
    subtitle: "Use your phone number or email to continue.",
    identifierLabel: "Phone or email",
    failHint: "To see an auth error, use {email} or {phone}.",
    signingIn: "Signing in...",
    signInFailed: "Unable to sign in. Please try again.",
  },
  home: {
    welcomeBack: "Welcome back",
    spinUser: "Spin User",
    signOut: "Sign out",
    loadingWallet: "Loading wallet",
    walletLoadError: "Could not load your wallet. Please try again.",
    availableBalance: "Available balance",
    newTransaction: "New transaction",
    recentMovements: "Recent movements",
    seeAll: "See all",
    noRecentMovements: "No recent movements.",
  },
  transaction: {
    confirmTitle: "Confirm transaction",
    youAreSending: "You are sending",
    toRecipient: "To {name}",
    sending: "Sending...",
    send: "Send",
    edit: "Edit",
    title: "New transaction",
    available: "Available {amount}",
    amount: "Amount",
    favorites: "Favorites",
    newContact: "New contact",
    identifierPlaceholder: "Phone or email",
    continue: "Continue",
  },
  receipts: {
    allTransactions: "All transactions",
    loadingTransactions: "Loading transactions",
    noTransactions: "No transactions.",
    notFound: "Transaction not found",
    receipt: "Receipt",
    receiptId: "Receipt ID",
    description: "Description",
    amount: "Amount",
    time: "Time",
  },
  validation: {
    login: {
      identifierRequired: "Phone or email is required.",
      identifierInvalid: "Enter a valid email or phone number.",
    },
    transaction: {
      amountRequired: "Amount is required.",
      amountPositive: "Amount must be greater than 0.",
      amountDecimals: "Amount must have at most 2 decimal places.",
      insufficientFunds: "Insufficient funds.",
      recipientRequired: "Recipient is mandatory.",
    },
  },
  errors: {
    WALLET_FETCH_ERROR: "Could not load your wallet. Please try again.",
    UNKNOWN_ERROR: "Unexpected error.",
    AUTH_ERROR: "Unable to sign in. Please try again.",
    INVALID_IDENTIFIER: "Enter a valid email or phone number.",
    BAD_REQUEST: "Malformed request.",
    MISSING_RECIPIENT: "Recipient is mandatory.",
    INVALID_AMOUNT: "Invalid amount.",
    INSUFFICIENT_FUNDS: "Insufficient funds.",
    TIMEOUT: "Server timeout.",
    NETWORK_ERROR: "Connection error.",
    NOT_FOUND: "Transaction not found.",
    UNAUTHORIZED: "Sign in required.",
  },
}

export type Messages = typeof en

export const es: Messages = {
  common: {
    loading: "Cargando...",
    back: "Atrás",
    retry: "Reintentar",
    language: "Idioma",
  },
  auth: {
    brand: "Spin Wallet",
    signIn: "Iniciar sesión",
    subtitle: "Usa tu teléfono o correo para continuar.",
    identifierLabel: "Teléfono o correo",
    failHint: "Para ver un error de autenticación, usa {email} o {phone}.",
    signingIn: "Iniciando sesión...",
    signInFailed: "No se pudo iniciar sesión. Inténtalo de nuevo.",
  },
  home: {
    welcomeBack: "Bienvenido de nuevo",
    spinUser: "Usuario Spin",
    signOut: "Cerrar sesión",
    loadingWallet: "Cargando billetera",
    walletLoadError: "No se pudo cargar tu billetera. Inténtalo de nuevo.",
    availableBalance: "Saldo disponible",
    newTransaction: "Nueva transacción",
    recentMovements: "Movimientos recientes",
    seeAll: "Ver todos",
    noRecentMovements: "No hay movimientos recientes.",
  },
  transaction: {
    confirmTitle: "Confirmar transacción",
    youAreSending: "Vas a enviar",
    toRecipient: "Para {name}",
    sending: "Enviando...",
    send: "Enviar",
    edit: "Editar",
    title: "Nueva transacción",
    available: "Disponible {amount}",
    amount: "Monto",
    favorites: "Favoritos",
    newContact: "Nuevo contacto",
    identifierPlaceholder: "Teléfono o correo",
    continue: "Continuar",
  },
  receipts: {
    allTransactions: "Todas las transacciones",
    loadingTransactions: "Cargando transacciones",
    noTransactions: "No hay transacciones.",
    notFound: "Transacción no encontrada",
    receipt: "Recibo",
    receiptId: "ID de recibo",
    description: "Descripción",
    amount: "Monto",
    time: "Hora",
  },
  validation: {
    login: {
      identifierRequired: "El teléfono o correo es obligatorio.",
      identifierInvalid: "Ingresa un correo o teléfono válido.",
    },
    transaction: {
      amountRequired: "El monto es obligatorio.",
      amountPositive: "El monto debe ser mayor que 0.",
      amountDecimals: "El monto debe tener como máximo 2 decimales.",
      insufficientFunds: "Fondos insuficientes.",
      recipientRequired: "El destinatario es obligatorio.",
    },
  },
  errors: {
    WALLET_FETCH_ERROR: "No se pudo cargar tu billetera. Inténtalo de nuevo.",
    UNKNOWN_ERROR: "Error inesperado.",
    AUTH_ERROR: "No se pudo iniciar sesión. Inténtalo de nuevo.",
    INVALID_IDENTIFIER: "Ingresa un correo o teléfono válido.",
    BAD_REQUEST: "Solicitud no válida.",
    MISSING_RECIPIENT: "El destinatario es obligatorio.",
    INVALID_AMOUNT: "Monto no válido.",
    INSUFFICIENT_FUNDS: "Fondos insuficientes.",
    TIMEOUT: "Tiempo de espera agotado.",
    NETWORK_ERROR: "Error de conexión.",
    NOT_FOUND: "Transacción no encontrada.",
    UNAUTHORIZED: "Debes iniciar sesión.",
  },
}

export const dictionaries: Record<Locale, Messages> = { es, en }

export const interpolate = (
  template: string,
  vars: Record<string, string>,
): string => template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "")

export const messageForErrorCode = (
  code: string,
  messages: Messages,
): string => {
  if (Object.hasOwn(messages.errors, code)) {
    return messages.errors[code as keyof Messages["errors"]]
  }
  return messages.errors.UNKNOWN_ERROR
}

export const isLocale = (value: string | null): value is Locale =>
  value === "es" || value === "en"
