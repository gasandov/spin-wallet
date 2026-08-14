# Uso de IA

Cómo se usó Cursor en este challenge (13–14 ago 2026). Primera persona: yo dirigí el producto y el agente escribió la mayor parte del código.

## Herramientas

- **Cursor Agent** en modo Plan y luego Agent. Modelo Grok (Cursor).
- Reglas para crear estándares de código y lineamientos.
- **WebFetch** a [spinbyoxxo.com.mx](https://spinbyoxxo.com.mx) para mapear naranja (`#ff6600`) y morado (`#531bc8`) a tokens.
- Vitest para verificar dominio y el formulario de login (lo corrió el agente, no lo escribí a mano cada vez).

No usé Copilot, ChatGPT aparte ni codegen fuera de Cursor.

## En qué partes del proyecto

| Sesión | Qué pedí                                                                                                                                                                             | Qué tocó la IA                                                                                               |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| 1      | Brief de arquitectura (stack, pantallas, ruleta)                                                                                                                                     | `src/domain/*`, login / home / transacción, `POST /api/transactions`, Zustand, Query, tests de ruleta y auth |
| 2      | Sign out, credenciales que fallan, error al cargar wallet, sanitizado de monto, lista de movimientos, `/transactions`, validar payload hijacked, autocomplete, deep links y recibos; | Auth, wallet en memoria, `sanitizeAmount`, parser del API, páginas de listado y recibo                       |     |
| 3      | Alinear UI a Spin: colores, Font Awesome, back con icono                                                                                                                             | `globals.css`, `BackLink`, iconos                                                                            |
| 4      | Este documento, README y DECISIONS                                                                                                                                                   | Solo markdown                                                                                                |
| 5      | i18n: español default, inglés opcional, switcher de idioma; actualizar docs                                                                                                          | Diccionarios, store de locale, switcher en `ScreenShell`, copy de pantallas y schemas, tests, markdown       |

Fase 1 (`create-next-app`, deps, Prettier, reglas de Cursor) ya estaba en el repo antes de la primera sesión de implementación.

## Qué acepté directo

- Split `domain` / `store` / `lib` y pages delgadas.
- Ruleta extraída a `roulette.ts` con RNG inyectable y tests en los umbrales.
- Un solo parser de payload (`parseTransactionRequest`) compartido por el route handler.
- Tokens semánticos (`primary`, `accent`) en vez de hex en componentes.
- `BackLink` reutilizado en transacción, listado y recibo.
- i18n sin librería nueva ni rutas `/{locale}`: diccionarios tipados, Zustand + `localStorage`, traducir errores del API por `code`.

## Qué corregí o rechacé

- El brief pedía **Home RSC**. El agente lo hizo CSR porque TanStack Query y la sesión viven en el cliente. Lo acepté como trade-off y lo documenté; no forcé un híbrido artificial.
- No acepté Clerk, shadcn ni un backend real: el challenge es un mock.
- No acepté `next-intl` ni rutas `/{locale}`: rompían el `proxy.ts` de sesión y no aportan SEO en un mock autenticado.

## Qué decidí yo y no la IA

- El **brief**: Next.js, Zustand, TanStack Query, Tailwind, Vitest, porcentajes de la ruleta, flujo capture → confirm.
- Las **Cursor rules** (ponytail, coding-standards, react-architecture): handlers nombrados, `ui/` sin Zustand, sin hex en componentes.
- El **backlog post-v1**: sign out, página de todos los movimientos, recibo por id, autocomplete, validar hijack, error al fetch del wallet, credenciales fijas para reproducir auth error.
- El **branding**: naranja en CTAs, morado en el card de saldo, Font Awesome, recibo centrado y back a home (no al listado).
- UI en **español por defecto**, con switcher a inglés en cada pantalla.

La IA propuso el detalle de carpetas, el wallet en memoria del cliente, `skipHydration` en Zustand y no mutar saldo en el API. Yo lo dejé pasar porque encaja con un mock de un par de días; no es una decisión que yo hubiera escrito antes de ver el plan.
