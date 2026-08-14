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

Cualquier email o teléfono con formato válido inicia sesión.

Para forzar un error de auth usa `fail@spin.app` o `0000000000`.

El envío de dinero pasa por una ruleta en `/api/transactions`: ~50% éxito, el resto timeout (~10s), error de red, fondos insuficientes o error genérico. Cargar el wallet falla ~20% de las veces (hay Retry).

## Librerías

| Librería | Para qué |
| --- | --- |
| **Next.js 16** (App Router) + **React 19** + **TypeScript** | App, rutas y route handler |
| **Zustand** | Sesión persistida en `localStorage` |
| **TanStack Query** | Fetch del wallet y mutación de transacción (loading / error / retry) |
| **React Hook Form** + **Zod** | Validación de login y de captura de transacción |
| **Tailwind CSS 4** | Estilos; tokens en `src/app/globals.css` |
| **Font Awesome** | Iconos |
| **Vitest** + **Testing Library** | Tests de dominio y del formulario de login |

## Limitaciones conocidas

- Auth mock. `AuthGate` corre en el cliente y guarda la sesión en `localStorage`; no hay cookie httpOnly ni redirect en el servidor.
- El wallet vive en memoria del módulo cliente (`src/domain/wallet.ts`). Se pierde al recargar. El API no muta el saldo: el cliente registra el movimiento después de un 200.
- Home es CSR, no RSC: TanStack Query y la sesión lo impiden.
- Contactos nuevos no se persisten como favoritos.
- No hay backend real ni tests E2E.
