import type { AppData, Bill, EmiPlan } from '../types'
import { uid } from '../utils/id'
import { fetchData, githubEnabled, writeData } from './github'

/**
 * Storage layer.
 *
 * The rest of the app depends only on the `StorageAdapter` interface:
 *   - subscribe(cb): listen for data changes (initial + live updates)
 *   - save(data):    persist the full app data
 *
 * Two implementations are provided. The active one is chosen by whether
 * Firebase is configured. To add another backend, implement the interface and
 * point `storage` at it — no UI changes needed.
 */
export interface StorageAdapter {
  subscribe(cb: (data: AppData) => void): () => void
  save(data: AppData): void
}

function newBill(): Bill {
  return {
    id: uid(),
    entries: [],
    createdAt: new Date().toISOString(),
    paid: false,
  }
}

// The seeded EMI plan: a 6-month loan paid through the owner's account.
// Month 1 carried convenience (₹270) + processing (₹299) fees. The friend paid
// ₹4,500 against a ₹4,447 due, so the ₹53 overpayment is credited to month 2.
// Base EMIs total ₹23,269 (five months of ₹3,878 + a final ₹3,879).
function defaultEmiPlan(): EmiPlan {
  return {
    title: "Friend's EMI",
    installments: [
      {
        id: 'emi-1',
        month: 1,
        emi: 3878,
        charges: [
          { label: 'Convenience fee', amount: 270 },
          { label: 'Processing fee', amount: 299 },
        ],
        credit: 0,
        paid: true,
        paidAt: '2026-06-01T00:00:00.000Z',
      },
      { id: 'emi-2', month: 2, emi: 3878, charges: [], credit: 53, paid: false },
      { id: 'emi-3', month: 3, emi: 3878, charges: [], credit: 0, paid: false },
      { id: 'emi-4', month: 4, emi: 3878, charges: [], credit: 0, paid: false },
      { id: 'emi-5', month: 5, emi: 3878, charges: [], credit: 0, paid: false },
      { id: 'emi-6', month: 6, emi: 3879, charges: [], credit: 0, paid: false },
    ],
  }
}

export function emptyData(): AppData {
  return { currentBill: newBill(), history: [], emi: defaultEmiPlan() }
}

// Fill in any missing pieces so the UI always gets a well-shaped object.
function normalize(data: Partial<AppData> | undefined): AppData {
  const safe = data ?? {}
  const emi = safe.emi
  return {
    currentBill: safe.currentBill ?? newBill(),
    history: Array.isArray(safe.history) ? safe.history : [],
    emi: emi && Array.isArray(emi.installments) ? emi : defaultEmiPlan(),
  }
}

// ---------------------------------------------------------------------------
// localStorage adapter — per-device, used as a fallback when Firebase is off.
// ---------------------------------------------------------------------------
const KEY = 'ftrack-data'

function loadLocal(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? normalize(JSON.parse(raw)) : emptyData()
  } catch {
    return emptyData()
  }
}

const localStorageAdapter: StorageAdapter = {
  subscribe(cb) {
    cb(loadLocal())
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) cb(loadLocal())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  },
  save(data) {
    localStorage.setItem(KEY, JSON.stringify(data))
  },
}

// ---------------------------------------------------------------------------
// GitHub adapter — a shared JSON file in a public repo (public read, owner write).
// Reads on load, on tab focus, and every 60s while the tab is visible.
// ---------------------------------------------------------------------------
const githubAdapter: StorageAdapter = {
  subscribe(cb) {
    let active = true
    const load = () =>
      fetchData()
        .then((d) => active && cb(d ? normalize(d) : emptyData()))
        .catch((err) => console.error(err))

    load()
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load()
    }, 60_000)

    return () => {
      active = false
      window.removeEventListener('focus', onFocus)
      clearInterval(timer)
    }
  },
  save(data) {
    // Fire-and-forget; a failed write self-corrects on the next refresh.
    void writeData(data).catch((err) => console.error('Save failed', err))
  },
}

// The active adapter. Swap backends by changing this single line.
export const storage: StorageAdapter = githubEnabled ? githubAdapter : localStorageAdapter

export { newBill }
