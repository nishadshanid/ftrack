import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { CalendarClock, Fuel, History, LayoutDashboard, Lock } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

// Two independent sections that share one deployment but never link to each
// other, so the fuel person and the EMI person each see only their own pages.
const fuelLinks = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/history', label: 'History', icon: History, end: false },
  { to: '/admin', label: 'Admin', icon: Lock, end: false },
]
const emiLinks = [{ to: '/emi', label: 'EMI', icon: CalendarClock, end: false }]

export function Layout() {
  const { pathname } = useLocation()
  const isEmi = pathname.startsWith('/emi')
  const links = isEmi ? emiLinks : fuelLinks

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-24 pt-4">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600 text-white">
            {isEmi ? <CalendarClock size={18} /> : <Fuel size={18} />}
          </span>
          <span className="text-lg font-bold tracking-tight">{isEmi ? 'EMI Tracker' : 'FTrack'}</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Bottom tab bar — mobile first. Links are scoped to the current section. */}
      <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md border-t border-slate-200 bg-white/90 px-4 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <ul className="flex items-center justify-around">
          {links.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-500'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon size={20} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
