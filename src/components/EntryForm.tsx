import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import type { Entry } from '../types'
import { todayISO } from '../utils/format'

export interface EntryValues {
  amount: number
  date: string
  notes?: string
}

interface Props {
  // When provided, the form is in "edit" mode and pre-filled.
  initial?: Entry
  onSubmit: (values: EntryValues) => void
  onCancel?: () => void
}

// Add / edit form for a single entry. Edit mode is active when `initial` is set.
export function EntryForm({ initial, onSubmit, onCancel }: Props) {
  const editing = Boolean(initial)
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [notes, setNotes] = useState(initial?.notes ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) return
    onSubmit({ amount: value, date, notes: notes.trim() || undefined })
    if (!editing) {
      setAmount('')
      setNotes('')
      setDate(todayISO())
    }
  }

  const field =
    'w-full rounded-xl border border-slate-200 bg-transparent px-4 py-3 outline-none focus:border-primary-500 dark:border-slate-700'

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{editing ? 'Edit Entry' : 'Add Entry'}</h2>
        {editing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel edit"
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-500 dark:text-slate-400">Amount (₹)</label>
        <input
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className={field}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-500 dark:text-slate-400">Date</label>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={field}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-500 dark:text-slate-400">
          Notes (optional)
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Petrol — Indian Oil"
          className={field}
        />
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 font-semibold text-white transition-colors hover:bg-primary-700"
      >
        <Plus size={18} />
        {editing ? 'Save Changes' : 'Add Entry'}
      </motion.button>
    </form>
  )
}
