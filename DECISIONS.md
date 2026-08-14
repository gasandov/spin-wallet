# Decisiones de diseño

Por qué el repo está armado así, dónde termina la UI y empieza el dominio, qué bordes se cubrieron y qué se dejaría para después.

## Por qué esta estructura

```
src/app/          rutas y route handler
src/components/   UI (las pages delegan; ui/ no toca Zustand)
src/domain/       reglas, schemas, mocks, ruleta
src/store/        sesión
src/lib/          fetch tipado hacia /api/transactions
```

El brief pedía Next.js App Router y TypeScript. El repo ya venía de `create-next-app`, así que no se cambió de framework.

Las capas existen para poder testear la ruleta, el parseo del payload y los schemas de Zod **sin montar React**. Las pages de App Router son delgadas: importan un contenedor y listo. Los componentes atómicos en `src/components/ui/` no leen el store; rutas y contenedores sí, y bajan props.

Zustand queda solo para sesión (quién está logueado). TanStack Query queda para estado asíncrono (wallet y mutación). Mezclar ambos en un solo store habría acoplado loading/error de red con persistencia de login.

## UI vs lógica de negocio

**Dominio** (`src/domain/`):

- `auth.ts` — schema de login, delay mock, credenciales que fallan, nombre para mostrar.
- `transaction.ts` — `sanitizeAmount`, schema del formulario (saldo, >0, ≤2 decimales, destinatario) y `parseTransactionRequest` para el API.
- `roulette.ts` — outcome aleatorio del POST; el RNG se inyecta para tests.
- `wallet.ts` — snapshot en memoria, `recordTransaction`, formateo de moneda y fecha.
- `wallet.types.ts` — tipos compartidos, no lógica.

**UI:** React Hook Form en login y captura; flujo en dos pasos (capture → confirm); Query para loading / error / empty / retry.

**API:** `src/app/api/transactions/route.ts` llama al parser de dominio. No reimplementa “monto válido” ni “destinatario obligatorio”. Si el payload viene hijacked, falla igual.

**Cliente HTTP:** `src/lib/api.ts` traduce el JSON a `WalletApiError` o a un recibo tipado. Los componentes no parsean a mano.

## Edge cases

- **Monto:** el input solo deja dígitos y un punto; `sanitizeAmount` recorta a 2 decimales; Zod rechaza 0, negativos, más de 2 decimales y montos mayores al saldo.
- **Payload hijacked:** el API rechaza `amount` string, 0, negativos, más de 2 decimales y `contactId` vacío.
- **Ruleta:** timeout (espera 10s + 408), network 503, insufficient 422, unknown 500, success 200. Los tests clavan el RNG en los umbrales 1–10, 11–25, 26–40, 41–50, 51–100.
- **Login:** vacío, ni email ni teléfono, `fail@spin.app` / `0000000000`.
- **Wallet:** ~20% de fetch falla; hay Retry. Lista vacía. Recibo con id desconocido → “Transaction not found”.
- **Sesión:** `skipHydration` + `AuthGate` esperan a rehidratar para no pintar Home y luego redirigir a login.
- **Fechas:** `formatTimestamp` (UTC) es el mismo en la lista de movimientos y en el recibo.

## Qué haría diferente con más tiempo

- Persistencia real (DB) y mutar el saldo **en el servidor**, no en el módulo cliente después del 200.
- Sesión en cookie httpOnly y redirect en el servidor; hoy el gate es solo UI.
- Home como RSC con prefetch del wallet, como pedía el brief. Hoy es CSR porque Query y la sesión viven en el cliente.
- E2E (Playwright) del flujo capture → confirm → recibo, incluyendo un outcome de error.
- Timeout de verdad (`AbortSignal`) en vez de `delay(10_000)` que deja el request colgado.
- Guardar contactos nuevos como favoritos.
- i18n (la UI está en inglés; el producto es Spin México).
