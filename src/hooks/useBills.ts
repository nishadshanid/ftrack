import { useSyncExternalStore } from 'react'
import { store } from '../services/store'

// Reactive access to the bill data plus the mutating actions.
// Any component that calls this re-renders when the data changes.
export function useBills() {
  const data = useSyncExternalStore(store.subscribe, store.getSnapshot)

  return {
    currentBill: data.currentBill,
    history: data.history,
    addEntry: store.addEntry,
    updateEntry: store.updateEntry,
    deleteEntry: store.deleteEntry,
    closeCurrentBill: store.closeCurrentBill,
    setBillPaid: store.setBillPaid,
  }
}

// Sum of all entry amounts in a bill.
export function billTotal(entries: { amount: number }[]): number {
  return entries.reduce((sum, e) => sum + e.amount, 0)
}
