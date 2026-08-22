# Decisiones de diseño

Por qué el repo está armado así, dónde termina la UI y empieza el dominio, qué bordes se cubrieron y qué se dejaría para después. Las decisiones están explicadas junto con sus trade-offs para que el mock sea fácil de evaluar y de extender sin confundir estado de UI con estado de negocio.

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

El brief pedía Next.js App Router y TypeScript. El repo ya venía de `create-next-app`, así que no se cambió de framework. App Router permite mantener las rutas, layouts y route handlers en el mismo árbol, y deja las páginas delgadas mientras los componentes cliente manejan los flujos interactivos.

Las capas existen para poder testear la ruleta, el parseo del payload, los schemas de Zod y el store **sin montar React**. Las pages de App Router son delgadas y solo ensamblan componentes. Los componentes atómicos en `src/components/ui/` no leen el store: reciben props, por lo que se pueden reutilizar y probar sin conocer el resto de la aplicación.

### Por qué Zustand

Zustand resuelve el estado pequeño y global que necesita la UI sin introducir reducers, providers adicionales ni una capa de persistencia implícita. Aquí guarda el `displayName` después del login y la preferencia de idioma; son datos de presentación que varias pantallas necesitan. No es la fuente de verdad del saldo ni de la autenticación: el saldo vive en el servidor y la sesión vive en la cookie. Esta separación evita que un estado cliente obsoleto pueda autorizar una operación o inventar un balance.

### Por qué `localStorage`

El idioma es una preferencia del navegador, no parte del recurso wallet ni de la URL, por eso se persiste con la clave `spin_locale`. Así el usuario conserva `es` o `en` entre recargas sin añadir prefijos de locale a cada ruta ni introducir una librería de routing internacionalizado para un mock sin necesidades de SEO. La consecuencia es que `localStorage` solo está disponible en el cliente: el HTML comienza en español y se hidrata con la preferencia guardada, lo que puede producir un flash breve. Una versión de producción podría mover la preferencia a una cookie para resolverla durante SSR.

### Por qué cookies httpOnly

La cookie `spin_session` permite que el navegador envíe la sesión automáticamente a los route handlers y que `proxy.ts` pueda hacer redirects de páginas antes de renderizar. Al ser `httpOnly`, el JavaScript de la página no puede leerla directamente, reduciendo la exposición accidental del identificador frente a scripts de terceros. El cliente mantiene solo una copia de presentación en Zustand y vuelve a consultar `/api/auth/session` cuando necesita reconstruirla. En este challenge el valor es un identifier sin firmar, por lo que es deliberadamente forjable; firmar la cookie o usar un proveedor de auth sería el siguiente paso fuera del alcance del mock.

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

### Por qué cada frontera

- `src/app/` contiene convenciones de Next: páginas, layout, proxy y endpoints HTTP; no concentra reglas de negocio.
- `src/components/` contiene la UI compuesta y los pasos interactivos; `components/ui/` contiene piezas presentacionales.
- `src/domain/` contiene reglas deterministas, tipos, schemas y la ruleta; puede probarse sin navegador ni servidor.
- `src/server/` contiene efectos de servidor: cookie de sesión y ledger; no se importa desde componentes cliente.
- `src/store/` contiene estado de presentación compartido; no reemplaza al servidor.
- `src/lib/` contiene el cliente HTTP tipado y la configuración de Query, aislando `fetch` de la UI.
- `src/i18n/` contiene diccionarios y traducción por códigos; evita duplicar copy condicional en cada componente.

Esta división hace explícito dónde se puede cambiar una decisión. Por ejemplo, sustituir el `Map` por una base de datos afecta al servidor y sus pruebas, no a las páginas; cambiar el mecanismo de idioma afecta al store y los diccionarios, no a la validación de montos.

### Por qué TanStack Query

El wallet es estado remoto: necesita loading, error, retry, cache e invalidación después de una mutación. TanStack Query cubre ese ciclo sin copiar el saldo a Zustand ni coordinar manualmente estados entre home, listado y recibo. Después de enviar, el cliente invalida la query y vuelve a pedir el saldo; el cliente nunca calcula ni confirma el balance por su cuenta.

### Por qué Zod y React Hook Form

React Hook Form maneja el estado y los eventos del formulario con poco código, mientras Zod concentra las reglas de entrada. El formulario usa un schema con el balance visible para feedback inmediato y el API reutiliza un parser independiente para validar nuevamente payloads manipulados. La validación de UI mejora la experiencia, pero la validación del servidor sigue siendo obligatoria.

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
- **Auth en páginas:** `proxy.ts` hace el redirect optimista según la cookie. `/login` no hace una consulta cliente redundante de sesión; en rutas protegidas, un 401 durante el bootstrap es un estado normal de usuario anónimo y no un error visible.

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
