import { useState } from 'react'
import { NavLink, Outlet, Route, Routes } from 'react-router-dom'
import {
  CalendarDays,
  FileText,
  Flame,
  Image as ImageIcon,
  LayoutDashboard,
  PanelLeft,
  PanelLeftClose,
  TrendingUp,
} from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Trends from './pages/Trends'
import Posts from './pages/Posts'
import CalendarPage from './pages/Calendar'
import Files from './pages/Files'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tendencias', label: 'Tendências', icon: TrendingUp, end: false },
  { to: '/posts', label: 'Posts', icon: FileText, end: false },
  { to: '/calendario', label: 'Calendário', icon: CalendarDays, end: false },
  { to: '/arquivos', label: 'Arquivos', icon: ImageIcon, end: false },
]

function Shell() {
  const [open, setOpen] = useState(true)
  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <aside
        className={`${open ? 'w-60' : 'w-16'} sticky top-0 flex h-screen shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/40 transition-all`}
      >
        <div className="flex h-16 items-center gap-2 px-4">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500 text-white">
            <Flame size={18} />
          </div>
          {open && <span className="font-semibold tracking-tight">Post Forge</span>}
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-2">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-300'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                }`
              }
              title={label}
            >
              <Icon size={18} className="shrink-0" />
              {open && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => setOpen((o) => !o)}
          className="m-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-800"
          title={open ? 'Recolher' : 'Expandir'}
        >
          {open ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          {open && <span>Recolher</span>}
        </button>
      </aside>

      <main className="flex-1 overflow-x-hidden px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Dashboard />} />
        <Route path="tendencias" element={<Trends />} />
        <Route path="posts" element={<Posts />} />
        <Route path="calendario" element={<CalendarPage />} />
        <Route path="arquivos" element={<Files />} />
      </Route>
    </Routes>
  )
}
