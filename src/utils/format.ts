// Currency + date formatting helpers (Indian rupee, en-IN grouping).

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

// "₹6,850"
export function formatCurrency(amount: number): string {
  return inr.format(amount)
}

// "24 Jun" — short day + month for entry rows.
export function formatShortDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

// "June 2026" — title for a closed bill in history.
export function formatMonthYear(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

// Today's date as "YYYY-MM-DD" for default form values / <input type="date">.
export function todayISO(): string {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  return new Date(d.getTime() - offset * 60_000).toISOString().slice(0, 10)
}
