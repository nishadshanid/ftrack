import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { Fuel } from 'lucide-react'
import { PageTransition } from '../components/PageTransition'
import { RideScene } from '../components/RideScene'
import { EntryCard } from '../components/EntryCard'
import { billTotal, useBills } from '../hooks/useBills'
import { formatCurrency } from '../utils/format'

export function Dashboard() {
  const { currentBill } = useBills()
  const entries = currentBill.entries
  const total = billTotal(entries)

  return (
    <PageTransition>
      {/* Hero total */}
      <motion.section
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="rounded-3xl bg-gradient-to-br from-primary-600 to-primary-700 p-6 text-white shadow-soft"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-primary-100">
          <Fuel size={16} /> Current Bill
        </div>
        <div className="mt-2 text-5xl font-extrabold tracking-tight tabular-nums">
          <CountUp end={total} duration={1} separator="," prefix="₹" />
        </div>
        <RideScene />
      </motion.section>

      {/* Current cycle entries */}
      <section className="mt-6">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-semibold">Current Cycle</h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="card text-center text-slate-500 dark:text-slate-400">
            No fuel added yet this cycle.
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <EntryCard key={entry.id} entry={entry} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Summary */}
      {entries.length > 0 && (
        <section className="mt-6 grid grid-cols-2 gap-3">
          <div className="card">
            <div className="text-sm text-slate-500 dark:text-slate-400">Total Entries</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">{entries.length}</div>
          </div>
          <div className="card">
            <div className="text-sm text-slate-500 dark:text-slate-400">Total Amount</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">{formatCurrency(total)}</div>
          </div>
        </section>
      )}
    </PageTransition>
  )
}
