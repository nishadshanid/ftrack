import { useState } from 'react'
import { motion } from 'framer-motion'
import { Archive, LogOut } from 'lucide-react'
import { PageTransition } from '../components/PageTransition'
import { Login } from '../components/Login'
import { EntryForm, type EntryValues } from '../components/EntryForm'
import { EntryCard } from '../components/EntryCard'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useAuth } from '../hooks/useAuth'
import { billTotal, useBills } from '../hooks/useBills'
import { formatCurrency } from '../utils/format'
import type { Entry } from '../types'

export function Admin() {
  const { authed, logout } = useAuth()
  const { currentBill, addEntry, updateEntry, deleteEntry, closeCurrentBill } = useBills()

  const [editing, setEditing] = useState<Entry | null>(null)
  const [deleting, setDeleting] = useState<Entry | null>(null)
  const [closing, setClosing] = useState(false)

  if (!authed) return <Login />

  const entries = currentBill.entries
  const total = billTotal(entries)

  function handleSubmit(values: EntryValues) {
    if (editing) {
      updateEntry(editing.id, values)
      setEditing(null)
    } else {
      addEntry(values)
    }
  }

  return (
    <PageTransition>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Admin</h1>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>

      <EntryForm
        key={editing?.id ?? 'new'}
        initial={editing ?? undefined}
        onSubmit={handleSubmit}
        onCancel={() => setEditing(null)}
      />

      {/* Current entries */}
      <section className="mt-6">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-semibold">Current Entries</h2>
          <span className="text-sm font-semibold tabular-nums">{formatCurrency(total)}</span>
        </div>

        {entries.length === 0 ? (
          <div className="card text-center text-slate-500 dark:text-slate-400">No entries yet.</div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                index={i}
                onEdit={setEditing}
                onDelete={setDeleting}
              />
            ))}
          </div>
        )}
      </section>

      {/* Close bill */}
      {entries.length > 0 && (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setClosing(true)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-warning/30 bg-orange-50 py-3 font-semibold text-warning transition-colors hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-950"
        >
          <Archive size={18} /> Close Current Bill
        </motion.button>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete entry?"
        message="This entry will be permanently removed from the current bill."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (deleting) deleteEntry(deleting.id)
          setDeleting(null)
        }}
        onCancel={() => setDeleting(null)}
      />

      <ConfirmDialog
        open={closing}
        title="Close current bill?"
        message={`${entries.length} entries (${formatCurrency(total)}) will be moved to History and a new empty cycle will start.`}
        confirmLabel="Close Bill"
        onConfirm={() => {
          closeCurrentBill()
          setClosing(false)
          setEditing(null)
        }}
        onCancel={() => setClosing(false)}
      />
    </PageTransition>
  )
}
