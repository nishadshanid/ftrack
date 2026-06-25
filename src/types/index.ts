// A single fuel purchase.
export interface Entry {
  id: string
  amount: number
  date: string // ISO date: "YYYY-MM-DD"
  notes?: string
  createdAt: string // ISO timestamp
}

// A billing cycle. `closedAt` is set once the bill is closed and moved to history.
export interface Bill {
  id: string
  entries: Entry[]
  createdAt: string
  closedAt?: string
  paid: boolean
}

// The whole app's persisted state.
export interface AppData {
  currentBill: Bill
  history: Bill[]
}
