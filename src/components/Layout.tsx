import { NavLink, Outlet } from 'react-router-dom'
import { Fuel, History, LayoutDashboard, Lock } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

const links = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/history', label: 'History', icon: History, end: false },
  { to: '/admin', label: 'Admin', icon: Lock, end: false },
]

export function Layout() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-24 pt-4">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600 text-white">
            <Fuel size={18} />
          </span>
          <span className="text-lg font-bold tracking-tight">FTrack</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Bottom tab bar — mobile first */}
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
