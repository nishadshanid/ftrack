import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { githubEnabled } from '../services/github'
import { PageTransition } from './PageTransition'

// Login gate for the admin page. In GitHub mode the secret is a Personal
// Access Token; otherwise it's the fallback password.
export function Login() {
  const { login } = useAuth()
  const [secret, setSecret] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const ok = await login(secret)
    setLoading(false)
    if (!ok) {
      setError(true)
      setSecret('')
    }
  }

  return (
    <PageTransition>
      <div className="mx-auto mt-10 max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-600 text-white">
            <Lock size={24} />
          </span>
          <h1 className="mt-4 text-xl font-bold">Admin Login</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {githubEnabled
              ? 'Paste your GitHub access token to manage bills.'
              : 'Enter the password to manage bills.'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-3">
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={secret}
            onChange={(e) => {
              setSecret(e.target.value)
              setError(false)
            }}
            placeholder={githubEnabled ? 'GitHub token (ghp_… / github_pat_…)' : 'Password'}
            className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-3 outline-none focus:border-primary-500 dark:border-slate-700"
          />
          {error && (
            <p className="text-sm text-red-500">
              {githubEnabled ? 'Invalid token.' : 'Incorrect password.'}
            </p>
          )}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary-600 py-3 font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
          >
            {loading ? 'Checking…' : 'Log In'}
          </motion.button>
        </form>
      </div>
    </PageTransition>
  )
}
