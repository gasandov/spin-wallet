# Spin Wallet

Simulación de una wallet de alto volumen: login mock, saldo, envío a contactos y recibos. No mueve dinero real.

La UI está en inglés. Decisiones de diseño: [DECISIONS.md](DECISIONS.md). Uso de IA: [AI_USAGE.md](AI_USAGE.md).

## Requisitos

- Node 24 (ver `.nvmrc`)
- Yarn (el repo versiona `.yarnrc.yml` y `yarn.lock`)

## Cómo ejecutar

```bash
yarn install
yarn dev
```

Abre [http://localhost:3000](http://localhost:3000).

Otros scripts:

```bash
yarn test                 # Vitest
yarn lint
yarn build && yarn start  # producción local
```

## Demo

Cualquier email o teléfono con formato válido inicia sesión (`POST /api/auth/login`). La sesión queda en una cookie httpOnly.

Para forzar un error de auth usa `fail@spin.app` o `0000000000`.

El ledger vive en el servidor (`Map` en memoria, un wallet por identifier). `GET /api/wallet` falla ~20% de las veces (hay Retry). `POST /api/transactions` valida el payload, rechaza si no alcanza el saldo, y el resto es ruleta de infra: timeout (~10s), red, error genérico o éxito (~65%).

## Librerías

| Librería                                                    | Para qué                                                    |
| ----------------------------------------------------------- | ----------------------------------------------------------- |
| **Next.js 16** (App Router) + **React 19** + **TypeScript** | App, `proxy.ts`, route handlers                             |
| **Zustand**                                                 | Cache de UI de la sesión (la fuente de verdad es la cookie) |
| **TanStack Query**                                          | Fetch del wallet y mutación (loading / error / retry)       |
| **React Hook Form** + **Zod**                               | Validación de login y de captura de transacción             |
| **Tailwind CSS 4**                                          | Estilos; tokens en `src/app/globals.css`                    |
| **Font Awesome**                                            | Iconos                                                      |
| **Vitest** + **Testing Library**                            | Tests de dominio, store y login                             |

## Limitaciones conocidas

- Auth mock: cookie httpOnly con el identifier **sin firmar** (forjable). `proxy.ts` redirige páginas; las APIs responden 401.
- El ledger es un `Map` en memoria del proceso Node pierde en restart / cold start;
- Home sigue CSR a propósito: Query maneja loading / error ~20% / Retry.
- Contactos nuevos no se persisten como favoritos.
- No hay tests E2E. El timeout de la ruleta es `delay(10_000)`, no un abort real.
