import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { CalendarDays, Dumbbell, LayoutDashboard, LogOut, ScanLine, Shield, UserCog, Users } from 'lucide-react'
import { Badge } from './ui/badge'

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const auth = JSON.parse(localStorage.getItem('fitgo-auth') || '{}')
  const role = auth?.usuario?.rol || ''

  const navItems = [
    ...(role === 'Administrador' ? [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    { to: '/socios', label: 'Socios', icon: Users },
    ...(role === 'Administrador' || role === 'Personal' ? [{ to: '/clases', label: 'Clases', icon: CalendarDays }] : []),
    ...(role === 'Administrador' || role === 'Personal' ? [{ to: '/entrenadores', label: 'Entrenadores', icon: Dumbbell }] : []),
    ...(role === 'Administrador' || role === 'Personal' ? [{ to: '/checkin', label: 'Check-in', icon: ScanLine }] : []),
    ...(role === 'Administrador' ? [{ to: '/usuarios', label: 'Usuarios', icon: UserCog }] : []),
    ...(role === 'Administrador' ? [{ to: '/roles', label: 'Roles', icon: Shield }] : [])
  ]

  const handleLogout = () => {
    localStorage.removeItem('fitgo-auth')
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full border-b border-slate-200 bg-white px-6 py-6 lg:w-72 lg:border-b-0 lg:border-r">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900">FIT GO</h2>
            <p className="text-sm text-slate-500">Panel administrativo</p>
          </div>
          <nav className="space-y-2">
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to || (to === '/socios' && location.pathname.startsWith('/socios')) || (to === '/clases' && location.pathname.startsWith('/clases'))
              return (
                <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              )
            })}
          </nav>
          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Usuario conectado</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="font-medium text-slate-900">{auth?.usuario?.nombre || 'Usuario'}</span>
              <Badge variant="outline">{role || 'Sin rol'}</Badge>
            </div>
            <button onClick={handleLogout} className="mt-4 flex items-center gap-2 text-sm text-red-600 hover:text-red-700">
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </aside>
        <main className="flex-1 px-4 py-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div>
              <p className="text-sm text-slate-500">Panel administrativo</p>
              <p className="font-medium text-slate-900">{auth?.usuario?.nombre || 'Usuario'}</p>
            </div>
            <Badge variant="outline" className="px-3 py-1">{role || 'Sin rol'}</Badge>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
