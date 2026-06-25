import { motion } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'
import type { Entry } from '../types'
import { formatCurrency, formatShortDate } from '../utils/format'

interface Props {
  entry: Entry
  index?: number
  onEdit?: (entry: Entry) => void
  onDelete?: (entry: Entry) => void
}

// One fuel entry. Shows actions only when handlers are provided (admin view).
export function EntryCard({ entry, index = 0, onEdit, onDelete }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05, ease: 'easeOut' }}
      className="card flex items-center justify-between gap-3"
    >
      <div className="min-w-0">
        <div className="font-semibold">{formatShortDate(entry.date)}</div>
        {entry.notes && (
          <div className="truncate text-sm text-slate-500 dark:text-slate-400">{entry.notes}</div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-lg font-bold tabular-nums">{formatCurrency(entry.amount)}</span>
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 pl-1">
            {onEdit && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit(entry)}
                aria-label="Edit entry"
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-800"
              >
                <Pencil size={16} />
              </motion.button>
            )}
            {onDelete && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(entry)}
                aria-label="Delete entry"
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
              >
                <Trash2 size={16} />
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
