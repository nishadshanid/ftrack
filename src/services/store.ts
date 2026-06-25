import type { AppData, Entry } from '../types'
import { storage, newBill, emptyData } from './storage'
import { uid } from '../utils/id'

/**
 * Tiny external store. Holds the app data in memory, persists every change
 * through the storage adapter, and notifies subscribers. Consumed via the
 * `useBills` hook with React's `useSyncExternalStore` — no Redux, no Context.
 *
 * The backend (Firestore or localStorage) pushes updates via storage.subscribe,
 * so changes made on another device appear here in real time.
 */

let data: AppData = emptyData()
const listeners = new Set<() => void>()

// Listen for changes from the backend (initial load + live updates).
storage.subscribe((remote) => {
  data = remote
  listeners.forEach((l) => l())
})

function emit() {
  // Optimistic local update for instant UI, then persist to the backend.
  storage.save(data)
  listeners.forEach((l) => l())
}

export const store = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  getSnapshot(): AppData {
    return data
  },

  addEntry(input: { amount: number; date: string; notes?: string }) {
    const entry: Entry = {
      id: uid(),
      amount: input.amount,
      date: input.date,
      notes: input.notes?.trim() || undefined,
      createdAt: new Date().toISOString(),
    }
    data = {
      ...data,
      currentBill: {
        ...data.currentBill,
        entries: [entry, ...data.currentBill.entries],
      },
    }
    emit()
  },

  updateEntry(id: string, patch: Partial<Omit<Entry, 'id' | 'createdAt'>>) {
    data = {
      ...data,
      currentBill: {
        ...data.currentBill,
        entries: data.currentBill.entries.map((e) =>
          e.id === id ? { ...e, ...patch, notes: patch.notes?.trim() || e.notes } : e,
        ),
      },
    }
    emit()
  },

  deleteEntry(id: string) {
    data = {
      ...data,
      currentBill: {
        ...data.currentBill,
        entries: data.currentBill.entries.filter((e) => e.id !== id),
      },
    }
    emit()
  },

  // Close the current bill: stamp it, push to history, open a fresh one.
  closeCurrentBill() {
    const closed = {
      ...data.currentBill,
      closedAt: new Date().toISOString(),
    }
    data = {
      currentBill: newBill(),
      history: [closed, ...data.history],
    }
    emit()
  },

  setBillPaid(billId: string, paid: boolean) {
    data = {
      ...data,
      history: data.history.map((b) => (b.id === billId ? { ...b, paid } : b)),
    }
    emit()
  },
}
