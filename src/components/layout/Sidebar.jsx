import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Users, Package,
  Tag, ShoppingCart, DollarSign, TrendingUp,
  Settings, LogOut, Zap, ChevronLeft, ChevronRight,
  ClipboardList, UserCircle,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { usePermiso } from '../../hooks/usePermiso'
import { isAdminUser, isSuperAdmin } from '../../utils/auth'
import clsx from 'clsx'

// 0 = Admin, 1 = Normal, 2 = Superadmin
const NAV_TODOS = [
  { to: '/dashboard',    label: 'Dashboard',   icon: LayoutDashboard, permission: null },
  { to: '/facturas',     label: 'Facturas',    icon: FileText,        permission: 'verFacturas' },
  { to: '/cotizaciones', label: 'Cotizaciones', icon: ClipboardList,   permission: 'verCotizaciones' },
  { to: '/clientes',     label: 'Clientes',    icon: Users,           permission: 'verClientes' },
  { divider: true },
  { to: '/productos',    label: 'Productos',   icon: Package,         permission: 'verProductos' },
  { to: '/inventario',   label: 'Inventario',  icon: ClipboardList,   permission: null },
  { to: '/categorias',   label: 'Categorías',  icon: Tag,             permission: null },
  { to: '/cuadres',      label: 'Cuadres',     icon: TrendingUp,      permission: 'verCuadres' },
]

const NAV_SOLO_ADMIN = [
  { divider: true },
  { to: '/compras',       label: 'Compras',       icon: ShoppingCart, permission: 'verCompras', adminOnly: true },
  { to: '/gastos',        label: 'Gastos',        icon: DollarSign,   permission: 'verGastos', adminOnly: true },
  { divider: true },
  { to: '/reportes',      label: 'Reportes',      icon: TrendingUp,   permission: 'verReportes', adminOnly: true },
  { to: '/configuracion', label: 'Configuración', icon: Settings,     permission: null, adminOnly: true },
  { to: '/usuarios',      label: 'Usuarios',      icon: UserCircle,   permission: null, adminOnly: true },
]

export function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const isAdmin  = isAdminUser(user)
  const { puedeVer } = usePermiso()

  // Filtrar items según permisos
  const filtrarItems = (items) => {
    return items.filter(item => {
      if (item.divider) return true
      if (item.adminOnly && !isAdmin) return false
      if (item.permission && !puedeVer(item.permission)) return false
      return true
    })
  }

  const navItems = [...filtrarItems(NAV_TODOS), ...filtrarItems(NAV_SOLO_ADMIN)]

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside
      className={clsx(
        'flex flex-col h-screen sticky top-0 border-r transition-all duration-200 z-20 flex-shrink-0',
        collapsed ? 'w-[60px]' : 'w-56'
      )}
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 h-14 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}>
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
          <Zap size={15} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-extrabold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
            SaleGz
          </span>
        )}
        <button onClick={onToggle}
          className="ml-auto p-1 rounded hover:bg-[var(--bg-tertiary)] transition-colors"
          style={{ color: 'var(--text-muted)' }}>
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {navItems.map((item, i) => {
          if (item.divider) return (
            <div key={i} className="my-1.5 mx-1 border-t" style={{ borderColor: 'var(--border)' }} />
          )
          const Icon = item.icon
          return (
            <NavLink key={item.to} to={item.to}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) => clsx(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors',
                collapsed && 'justify-center',
                isActive ? 'bg-brand-600 text-white' : 'hover:bg-[var(--bg-tertiary)]'
              )}
              style={({ isActive }) => ({ color: isActive ? '#fff' : 'var(--text-secondary)' })}>
              <Icon size={17} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Usuario */}
      <div className="border-t p-2 flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        {!collapsed ? (
          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <NavLink to="/perfil"
              className={({ isActive }) => clsx(
                'flex items-center gap-2 px-2 py-2 transition-colors hover:bg-[var(--bg-secondary)]',
                isActive && 'bg-[var(--bg-secondary)]'
              )}>
              <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{user?.nombre?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.nombre}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {isSuperAdmin(user) ? 'Superadmin' : isAdmin ? 'Administrador' : 'Usuario'}
                </p>
              </div>
              <UserCircle size={14} style={{ color: 'var(--text-muted)' }} />
            </NavLink>
            <button onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:text-red-500 transition-colors border-t"
              style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
              <LogOut size={13} /> Cerrar sesión
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <NavLink to="/perfil" title="Mi perfil"
              className="w-full flex justify-center p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
              <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{user?.nombre?.charAt(0).toUpperCase()}</span>
              </div>
            </NavLink>
            <button onClick={handleLogout}
              className="w-full flex justify-center p-2 rounded-lg hover:text-red-500 transition-colors"
              style={{ color: 'var(--text-muted)' }}>
              <LogOut size={17} />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
