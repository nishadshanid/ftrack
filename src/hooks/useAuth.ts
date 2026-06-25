import { useSyncExternalStore } from 'react'
import { clearToken, getToken, githubEnabled, setToken, verifyToken } from '../services/github'

/**
 * Admin authentication.
 *
 * With GitHub storage, "logging in" means providing a Personal Access Token
 * that can write to the repo. The token is validated, then stored in this
 * browser only — it is what authorises writes. The public dashboard needs no
 * login at all.
 *
 * When GitHub is not configured (local dev), it falls back to a simple
 * password check against VITE_ADMIN_PASSWORD.
 */

const FALLBACK_KEY = 'ftrack-auth'
let authed = githubEnabled
  ? Boolean(getToken())
  : sessionStorage.getItem(FALLBACK_KEY) === '1'
const listeners = new Set<() => void>()

function setAuthed(value: boolean) {
  authed = value
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAuth() {
  const isAuthed = useSyncExternalStore(subscribe, () => authed)

  // `secret` is a GitHub token (GitHub mode) or the admin password (fallback).
  async function login(secret: string): Promise<boolean> {
    const value = secret.trim()
    if (githubEnabled) {
      if (value && (await verifyToken(value))) {
        setToken(value)
        setAuthed(true)
        return true
      }
      return false
    }
    if (value && value === import.meta.env.VITE_ADMIN_PASSWORD) {
      sessionStorage.setItem(FALLBACK_KEY, '1')
      setAuthed(true)
      return true
    }
    return false
  }

  function logout() {
    if (githubEnabled) {
      clearToken()
    } else {
      sessionStorage.removeItem(FALLBACK_KEY)
    }
    setAuthed(false)
  }

  return { authed: isAuthed, login, logout }
}
