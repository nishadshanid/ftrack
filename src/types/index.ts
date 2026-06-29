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

// A one-time extra charged on a single EMI installment (e.g. fees).
export interface EmiCharge {
  label: string
  amount: number
}

// One month of an EMI plan.
// Amount due = emi + (sum of charges) - credit.
export interface EmiInstallment {
  id: string
  month: number // 1-based position in the plan
  emi: number // base EMI for this month
  charges: EmiCharge[] // one-time extras added this month (convenience/processing fees)
  credit: number // credit carried from a previous overpayment, reduces the amount due
  paid: boolean
  paidAt?: string // ISO timestamp, set when marked paid
}

// A fixed-term EMI plan paid through the owner's account on someone's behalf.
export interface EmiPlan {
  title: string
  installments: EmiInstallment[]
}

// The whole app's persisted state.
export interface AppData {
  currentBill: Bill
  history: Bill[]
  emi: EmiPlan
}
