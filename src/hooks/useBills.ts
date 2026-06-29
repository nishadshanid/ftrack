import { useSyncExternalStore } from 'react'
import { store } from '../services/store'
import type { EmiInstallment, EmiPlan } from '../types'

// Reactive access to the bill data plus the mutating actions.
// Any component that calls this re-renders when the data changes.
export function useBills() {
  const data = useSyncExternalStore(store.subscribe, store.getSnapshot)

  return {
    currentBill: data.currentBill,
    history: data.history,
    emi: data.emi,
    addEntry: store.addEntry,
    updateEntry: store.updateEntry,
    deleteEntry: store.deleteEntry,
    closeCurrentBill: store.closeCurrentBill,
    setBillPaid: store.setBillPaid,
    setEmiPaid: store.setEmiPaid,
  }
}

// Sum of all entry amounts in a bill.
export function billTotal(entries: { amount: number }[]): number {
  return entries.reduce((sum, e) => sum + e.amount, 0)
}

// --- EMI helpers -----------------------------------------------------------

// Total of the one-time charges (fees) on an installment.
export function chargesTotal(i: EmiInstallment): number {
  return i.charges.reduce((sum, c) => sum + c.amount, 0)
}

// Amount actually due this month: base EMI + fees, less any carried credit.
export function installmentDue(i: EmiInstallment): number {
  return i.emi + chargesTotal(i) - i.credit
}

// Grand total payable across the whole plan (net of credits).
export function emiTotal(plan: EmiPlan): number {
  return plan.installments.reduce((sum, i) => sum + installmentDue(i), 0)
}

// Sum of installments already marked paid.
export function emiPaidTotal(plan: EmiPlan): number {
  return plan.installments.reduce((sum, i) => sum + (i.paid ? installmentDue(i) : 0), 0)
}
