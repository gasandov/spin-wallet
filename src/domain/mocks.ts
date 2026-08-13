import type { Contact, Movement } from "./wallet.types"

export const MOCK_BALANCE = 1250.5

export const MOCK_FAVORITES: Contact[] = [
  { id: "c-ana", name: "Ana Ruiz", identifier: "ana@spin.app" },
  { id: "c-marco", name: "Marco Diaz", identifier: "+15551234567" },
  { id: "c-lee", name: "Lee Chen", identifier: "lee@spin.app" },
  { id: "c-priya", name: "Priya Shah", identifier: "+15559876543" },
]

export const MOCK_MOVEMENTS: Movement[] = [
  {
    id: "m1",
    description: "Received from Ana Ruiz",
    amount: 120,
    timestamp: "2026-08-10T14:22:00.000Z",
  },
  {
    id: "m2",
    description: "Sent to Marco Diaz",
    amount: -45.5,
    timestamp: "2026-08-09T09:10:00.000Z",
  },
  {
    id: "m3",
    description: "Coffee shop",
    amount: -8.75,
    timestamp: "2026-08-08T16:40:00.000Z",
  },
  {
    id: "m4",
    description: "Received from Lee Chen",
    amount: 60,
    timestamp: "2026-08-07T11:05:00.000Z",
  },
  {
    id: "m5",
    description: "Sent to Priya Shah",
    amount: -200,
    timestamp: "2026-08-06T18:30:00.000Z",
  },
]

export const EMPTY_MOVEMENTS: Movement[] = []
