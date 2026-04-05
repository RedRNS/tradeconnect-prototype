import { ClipboardCheck, LayoutDashboard, MessageSquareText, Search } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const menuItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/buyer-discovery', label: 'Cari Pembeli', icon: Search, hasUpdates: true },
  { to: '/deal-communication', label: 'Asisten Komunikasi', icon: MessageSquareText },
  { to: '/deal-readiness', label: 'Cek Kesiapan Deal', icon: ClipboardCheck },
]

function Sidebar() {
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-72 border-r border-slate-200 bg-surface p-5 md:block">
        <div className="mb-8 rounded-2xl bg-primary px-4 py-5 text-white shadow-soft">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-100">Prototype</p>
          <h1 className="text-2xl font-extrabold leading-tight">TradeConnect</h1>
        </div>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-secondary text-white shadow-soft'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
                end={item.to === '/'}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  {item.label}
                </span>
                {item.hasUpdates && <span className="h-2.5 w-2.5 rounded-full bg-accent" title="12 hasil baru" />}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-4 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur md:hidden">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={`mobile-${item.to}`}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-semibold ${
                  isActive ? 'text-primary' : 'text-slate-500'
                }`
              }
            >
              <Icon size={17} />
              <span className="text-center leading-tight">{item.label}</span>
              {item.hasUpdates && <span className="absolute right-3 top-2 h-2 w-2 rounded-full bg-accent" />}
            </NavLink>
          )
        })}
      </nav>
    </>
  )
}

export default Sidebar