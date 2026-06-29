import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { CalendarClock, CheckCircle2, Clock, Landmark } from 'lucide-react'
import { PageTransition } from '../components/PageTransition'
import { RunnerScene } from '../components/RunnerScene'
import { useAuth } from '../hooks/useAuth'
import {
  chargesTotal,
  emiPaidTotal,
  emiTotal,
  installmentDue,
  useBills,
} from '../hooks/useBills'
import { formatCurrency } from '../utils/format'
import type { EmiInstallment } from '../types'

function InstallmentCard({ inst, index }: { inst: EmiInstallment; index: number }) {
  const { authed } = useAuth()
  const { setEmiPaid } = useBills()
  const due = installmentDue(inst)
  const fees = chargesTotal(inst)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="card"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold">Month {inst.month}</div>
          <div className="mt-0.5 text-2xl font-bold tabular-nums">{formatCurrency(due)}</div>
        </div>
        {inst.paid ? (
          <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-success dark:bg-green-950">
            <CheckCircle2 size={14} /> Paid
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-warning dark:bg-orange-950">
            <Clock size={14} /> Pending
          </span>
        )}
      </div>

      {/* Breakdown — shown only when this month differs from a plain EMI. */}
      {(fees > 0 || inst.credit > 0) && (
        <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-sm dark:border-slate-800">
          <li className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">EMI</span>
            <span className="tabular-nums">{formatCurrency(inst.emi)}</span>
          </li>
          {inst.charges.map((c) => (
            <li key={c.label} className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">{c.label}</span>
              <span className="tabular-nums">+{formatCurrency(c.amount)}</span>
            </li>
          ))}
          {inst.credit > 0 && (
            <li className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Credit (overpaid earlier)</span>
              <span className="tabular-nums text-success">−{formatCurrency(inst.credit)}</span>
            </li>
          )}
        </ul>
      )}

      {authed && (
        <button
          onClick={() => setEmiPaid(inst.id, !inst.paid)}
          className="mt-3 w-full rounded-xl bg-slate-100 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Mark as {inst.paid ? 'Pending' : 'Paid'}
        </button>
      )}
    </motion.div>
  )
}

export function Emi() {
  const { emi } = useBills()
  const total = emiTotal(emi)
  const paid = emiPaidTotal(emi)
  const remaining = total - paid
  const paidCount = emi.installments.filter((i) => i.paid).length
  const pct = total > 0 ? Math.round((paid / total) * 100) : 0

  return (
    <PageTransition>
      {/* Hero — remaining balance + progress */}
      <motion.section
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="rounded-3xl bg-gradient-to-br from-primary-600 to-primary-700 p-6 text-white shadow-soft"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-primary-100">
          <Landmark size={16} /> {emi.title} · Remaining
        </div>
        <div className="mt-2 text-5xl font-extrabold tracking-tight tabular-nums">
          <CountUp end={remaining} duration={1} separator="," prefix="₹" />
        </div>

        <RunnerScene pct={pct} paid={paidCount} total={emi.installments.length} />

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/25">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-white"
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-primary-100">
          <span>{formatCurrency(paid)} paid</span>
          <span>{pct}%</span>
          <span>{formatCurrency(total)} total</span>
        </div>
      </motion.section>

      {/* Schedule */}
      <section className="mt-6">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="flex items-center gap-1.5 font-semibold">
            <CalendarClock size={18} /> Schedule
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {paidCount} of {emi.installments.length} paid
          </span>
        </div>

        <div className="space-y-3">
          {emi.installments.map((inst, i) => (
            <InstallmentCard key={inst.id} inst={inst} index={i} />
          ))}
        </div>
      </section>
    </PageTransition>
  )
}
