import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, ChevronDown, Clock } from 'lucide-react'
import { PageTransition } from '../components/PageTransition'
import { billTotal, useBills } from '../hooks/useBills'
import { useAuth } from '../hooks/useAuth'
import { formatCurrency, formatMonthYear, formatShortDate } from '../utils/format'
import type { Bill } from '../types'

function HistoryItem({ bill, index }: { bill: Bill; index: number }) {
  const { authed } = useAuth()
  const { setBillPaid } = useBills()
  const [open, setOpen] = useState(false)
  const total = billTotal(bill.entries)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="card"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div>
          <div className="font-semibold">
            {formatMonthYear(bill.closedAt ?? bill.createdAt)}
          </div>
          <div className="mt-0.5 text-2xl font-bold tabular-nums">{formatCurrency(total)}</div>
        </div>
        <div className="flex items-center gap-3">
          {bill.paid ? (
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-success dark:bg-green-950">
              <CheckCircle2 size={14} /> Paid
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-warning dark:bg-orange-950">
              <Clock size={14} /> Pending
            </span>
          )}
          <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-slate-400">
            <ChevronDown size={20} />
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3 dark:border-slate-800">
              {bill.entries.length === 0 && (
                <li className="text-sm text-slate-500">No entries.</li>
              )}
              {bill.entries.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between py-1 text-sm"
                >
                  <span className="text-slate-500 dark:text-slate-400">
                    {formatShortDate(e.date)}
                    {e.notes ? ` · ${e.notes}` : ''}
                  </span>
                  <span className="font-semibold tabular-nums">{formatCurrency(e.amount)}</span>
                </li>
              ))}
            </ul>

            {authed && (
              <button
                onClick={() => setBillPaid(bill.id, !bill.paid)}
                className="mt-3 w-full rounded-xl bg-slate-100 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Mark as {bill.paid ? 'Pending' : 'Paid'}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function History() {
  const { history } = useBills()

  return (
    <PageTransition>
      <h1 className="mb-4 text-xl font-bold">History</h1>
      {history.length === 0 ? (
        <div className="card text-center text-slate-500 dark:text-slate-400">
          No closed bills yet.
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((bill, i) => (
            <HistoryItem key={bill.id} bill={bill} index={i} />
          ))}
        </div>
      )}
    </PageTransition>
  )
}
