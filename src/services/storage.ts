import type { AppData, Bill } from '../types'
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

export function emptyData(): AppData {
  return { currentBill: newBill(), history: [] }
}

// Fill in any missing pieces so the UI always gets a well-shaped object.
function normalize(data: Partial<AppData> | undefined): AppData {
  const safe = data ?? {}
  return {
    currentBill: safe.currentBill ?? newBill(),
    history: Array.isArray(safe.history) ? safe.history : [],
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
