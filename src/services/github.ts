import type { AppData } from '../types'

/**
 * GitHub-as-database.
 *
 * Data is stored as a single JSON file in a PUBLIC GitHub repo:
 *   - Anyone can READ it (the dashboard fetches it without a token).
 *   - Only the owner can WRITE it, using a Personal Access Token entered at
 *     /admin. The token is kept in this browser's localStorage and is never
 *     bundled into the app.
 *
 * Repo coordinates come from env vars (they are public, not secrets).
 */

const owner = import.meta.env.VITE_GH_OWNER
const repo = import.meta.env.VITE_GH_REPO
const branch = import.meta.env.VITE_GH_BRANCH || 'main'
const path = import.meta.env.VITE_GH_PATH || 'data.json'

export const githubEnabled = Boolean(owner && repo)

const API = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`

// ---- token storage (owner's device only) ----
const TOKEN_KEY = 'ftrack-gh-token'
export const getToken = () => localStorage.getItem(TOKEN_KEY) || ''
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

function headers(): Record<string, string> {
  const h: Record<string, string> = { Accept: 'application/vnd.github+json' }
  const t = getToken()
  if (t) h.Authorization = `Bearer ${t}`
  return h
}

// UTF-8 safe base64 (GitHub stores file content base64-encoded).
function decodeBase64(b64: string): string {
  const bin = atob(b64.replace(/\n/g, ''))
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}
function encodeBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin)
}

// The file's current commit SHA — required by the GitHub API to update it.
let currentSha: string | undefined

// Reads the data file. Returns null if it does not exist yet.
export async function fetchData(): Promise<AppData | null> {
  const res = await fetch(`${API}?ref=${branch}&t=${Date.now()}`, {
    headers: headers(),
    cache: 'no-store',
  })
  if (res.status === 404) {
    currentSha = undefined
    return null
  }
  if (!res.ok) throw new Error(`GitHub read failed (${res.status})`)
  const json = await res.json()
  currentSha = json.sha
  return JSON.parse(decodeBase64(json.content)) as AppData
}

// Writes the data file (creates it on first save). Retries once on a SHA conflict.
export async function writeData(data: AppData): Promise<void> {
  const put = (sha?: string) =>
    fetch(API, {
      method: 'PUT',
      headers: { ...headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Update fuel data (${new Date().toISOString()})`,
        content: encodeBase64(JSON.stringify(data, null, 2)),
        branch,
        ...(sha ? { sha } : {}),
      }),
    })

  let res = await put(currentSha)
  if (res.status === 409) {
    // Stale SHA — someone/something changed the file. Refetch and retry once.
    await fetchData()
    res = await put(currentSha)
  }
  if (!res.ok) throw new Error(`GitHub write failed (${res.status})`)
  const json = await res.json()
  currentSha = json.content?.sha
}

// Validates a token by calling the authenticated user endpoint.
export async function verifyToken(token: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}` },
    })
    return res.ok
  } catch {
    return false
  }
}
