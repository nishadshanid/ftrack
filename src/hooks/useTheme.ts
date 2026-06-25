import { useCallback, useSyncExternalStore } from 'react'

// Dark mode toggle. The initial class is applied in index.html before paint;
// this hook keeps it in sync and persists the choice.

const KEY = 'ftrack-theme'
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function isDark(): boolean {
  return document.documentElement.classList.contains('dark')
}

export function useTheme() {
  const dark = useSyncExternalStore(subscribe, isDark)

  const toggle = useCallback(() => {
    const next = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem(KEY, next ? 'dark' : 'light')
    listeners.forEach((l) => l())
  }, [])

  return { dark, toggle }
}
