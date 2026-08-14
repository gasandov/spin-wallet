# Decisiones de diseño

Por qué el repo está armado así, dónde termina la UI y empieza el dominio, qué bordes se cubrieron y qué se dejaría para después.

## Por qué esta estructura

```
src/app/          rutas y route handlers
src/proxy.ts      redirect de páginas según cookie (no toca el Map)
src/components/   UI (las pages delegan; ui/ no toca Zustand)
src/domain/       reglas, schemas, mocks, ruleta
src/i18n/         diccionarios es/en y helpers
src/server/       sesión (cookie) y ledger en memoria
src/store/        cache de UI: sesión e idioma
src/lib/          fetch tipado hacia las APIs
```

El brief pedía Next.js App Router y TypeScript. El repo ya venía de `create-next-app`, así que no se cambió de framework.

Las capas existen para poder testear la ruleta, el parseo del payload, los schemas de Zod y el store **sin montar React**. Las pages de App Router son delgadas. Los componentes atómicos en `src/components/ui/` no leen el store.

Zustand es solo cache de UI (displayName). La sesión real es la cookie. TanStack Query es el estado asíncrono del wallet. El cliente **no** muta el saldo: después de un 200 solo invalida la query.

## UI vs lógica de negocio

**Dominio** (`src/domain/`):

- `auth.ts` — schema de login, delay mock, credenciales que fallan, nombre para mostrar.
- `transaction.ts` — `sanitizeAmount`, schema del formulario y `parseTransactionRequest` para el API.
- `roulette.ts` — timeout / network / unknown / success; el RNG se inyecta para tests.
- `wallet.ts` — formatters (locale opcional, default `es`), fail rate del GET, query key. Sin ledger.
- `wallet.types.ts` — tipos compartidos.

**Servidor** (`src/server/`):

- `session.ts` — cookie httpOnly, `requireSession()` → 401.
- `wallet-store.ts` — `Map<identifier, Wallet>`. Fuente de verdad del saldo.

**UI:** React Hook Form; capture → confirm; Query para loading / error / empty / retry. Copy vía diccionarios; el switcher vive en `ScreenShell`.

**API:** route handlers piden sesión, reutilizan parsers de dominio y mutan el store. El POST checa saldo real (422) y después tira la ruleta de infra. El servidor arma la descripción del movimiento.

**Cliente HTTP:** `src/lib/api.ts` traduce JSON a `WalletApiError` o a datos tipados.

## Edge cases

- **Monto:** el input solo deja dígitos y un punto; `sanitizeAmount` recorta a 2 decimales; Zod rechaza 0, negativos, más de 2 decimales y montos mayores al saldo (UI). El API vuelve a validar y compara contra el ledger del servidor.
- **Payload hijacked:** el API rechaza `amount` string, 0, negativos, más de 2 decimales y `contactId` vacío.
- **Fondos:** 422 determinista si `amount > balance`. Ya no sale “insufficient” al azar.
- **Ruleta:** timeout (10s + 408), network 503, unknown 500, success 200. Tests en 1–10, 11–25, 26–35, 36–100.
- **Login:** vacío, ni email ni teléfono, `fail@spin.app` / `0000000000`. Cookie + `proxy.ts` en páginas; APIs 401.
- **Wallet:** ~20% de `GET /api/wallet` → 503 + Retry. Recibo con id desconocido → 404 / “Transaction not found”.
- **Multi-usuario:** cada identifier tiene su Map entry. Logout no borra el ledger.
- **Fechas:** `formatTimestamp` (UTC, locale de la UI) es el mismo en la lista y en el recibo.
- **Idioma:** default `es`. Preferencia en Zustand + `localStorage` (`spin_locale`). Sin prefijo `/es` `/en` en las URLs: pelearía con `proxy.ts` y cada `Link`. Los mensajes del API siguen en inglés; la UI traduce por `code`. Los schemas de Zod defaultan a inglés (tests de dominio); los forms del cliente les pasan el diccionario activo.

## i18n

El producto es Spin México, así que el default es español. No se usó `next-intl` ni rutas por locale: la app es un mock autenticado (no SEO) y casi toda la UI ya es client. Un diccionario tipado + store existente es el diff mínimo.

`html lang` arranca en `es`. Quien tenga inglés guardado ve un flash corto al hidratar; cookie + SSR sería el upgrade.

## Qué haría diferente con más tiempo

- Persistencia real (DB) en lugar del Map.
- Firmar la cookie (JWT / Better Auth); hoy el valor es el identifier crudo.
- Home como RSC con prefetch del wallet. Hoy es CSR porque Query cubre el error ~20% y Retry.
- E2E (Playwright) del flujo capture → confirm → recibo.
- Timeout de verdad (`AbortSignal`) en vez de `delay(10_000)`.
- Guardar contactos nuevos como favoritos.
- Preferencia de idioma en cookie para pintar el SSR en inglés sin flash.
