import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Users, Package,
  Tag, ShoppingCart, DollarSign, TrendingUp,
  Settings, LogOut, Zap, ChevronLeft, ChevronRight,
  ClipboardList, UserCircle, Menu, X, HandCoins,
  Utensils, CakeSlice, MapPin,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuthStore } from '../../store/authStore'
import { usePermisosStore } from '../../store/permisosStore' // ← ajusta la ruta/nombre a tu archivo real
import { isAdminUser, isSuperAdmin } from '../../utils/auth'

// permission: null  → solo requiere estar autenticado
// permission: 'X.Y' → código de permiso de la API
// adminOnly: true   → además exige ser admin/superadmin
const NAV_ITEMS = [
  { to: '/dashboard',       label: 'Dashboard',     icon: LayoutDashboard, permission: null },
  { to: '/facturas',        label: 'Facturas',      icon: FileText,        permission: 'Facturas.Ver' },
  { to: '/cuentaporcobrar', label: 'Cuenta/Cobrar', icon: HandCoins,       permission: 'Facturas.Ver' },
  { to: '/cuentas-pagar',   label: 'Cuenta/Pagar',  icon: DollarSign,      permission: 'Compras.Ver' },
  { to: '/ordenes',         label: 'Órdenes',       icon: ShoppingCart,    permission: null },
  { to: '/notas-credito',   label: 'Notas Crédito', icon: FileText,        permission: 'NotasCredito.Ver' },
  { to: '/cotizaciones',    label: 'Cotizaciones',  icon: ClipboardList,   permission: 'Cotizaciones.Ver' },
  { to: '/clientes',        label: 'Clientes',      icon: Users,           permission: 'Clientes.Ver' },
  { divider: true },
  { to: '/productos',       label: 'Productos',     icon: Package,         permission: 'Productos.Ver' },
  { to: '/categorias',      label: 'Categorías',    icon: Tag,             permission: 'Categorias.Ver' },
  { to: '/cuadres',         label: 'Cuadres',       icon: TrendingUp,      permission: 'Cuadres.Ver' },
  { to: '/reportes',        label: 'Reportes',      icon: TrendingUp,      permission: 'Reportes.Ver' },
  { to: '/usuarios',        label: 'Usuarios',      icon: UserCircle,      permission: 'Usuarios.Ver' },
  { divider: true },
  { to: '/escuelas',        label: 'Escuelas',      icon: UserCircle,      permission: 'Escuelas.Ver' },
  { to: '/menu-comida',     label: 'Menú Comida',   icon: Utensils,        permission: 'MenuComida.Ver' },
  { to: '/postres',         label: 'Postres',       icon: CakeSlice,       permission: 'Postres.Ver' },
  { to: '/conduces',        label: 'Conduces',      icon: MapPin,          permission: 'Conduces.Ver' },
  { divider: true },
  { to: '/compras',         label: 'Compras',       icon: ShoppingCart,    permission: 'Compras.Ver' },
  { to: '/gastos',          label: 'Gastos',        icon: DollarSign,      permission: 'Gastos.Ver' },
  { divider: true },
  { to: '/ncf',             label: 'NCF',           icon: FileText,        permission: null, adminOnly: true },
  { to: '/fiscal',          label: 'Fiscal',        icon: TrendingUp,      permission: null, adminOnly: true },
  { divider: true },
  { to: '/configuracion',   label: 'Configuración', icon: Settings,        permission: 'Controles.Ver' },
]

// Hook para detectar si es móvil
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  )

  useEffect(() => {
    const media = window.matchMedia(query)
    const listener = (e) => setMatches(e.matches)
    setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

export function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const isAdmin = isAdminUser(user)

  // Suscripción a los códigos: el sidebar se re-renderiza si cambian los permisos
  const codigos = usePermisosStore((s) => s.codigos)

  const isMobile = useMediaQuery('(max-width: 767px)')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleMobileNav = () => setMobileOpen(false)

  const navItems = useMemo(() => {
    const visibles = NAV_ITEMS.filter((item) => {
      if (item.divider) return true
      if (item.adminOnly && !isAdmin) return false
      if (item.permission && !codigos.includes(item.permission)) return false
      return true
    })

    // Quita divisores seguidos, al inicio o al final
    return visibles.filter((item, i, arr) => {
      if (!item.divider) return true
      const prev = arr[i - 1]
      const next = arr[i + 1]
      return Boolean(prev && !prev.divider && next)
    })
  }, [codigos, isAdmin])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    if (isMobile) setMobileOpen(false)
  }

  const showLabels = isMobile || !collapsed

  const renderContent = () => (
    <>
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-3 h-14 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
          <Zap size={15} className="text-white" />
        </div>
        {showLabels && (
          <span className="font-extrabold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
            SaleGz
          </span>
        )}
        {!isMobile && onToggle && (
          <button
            onClick={onToggle}
            className="ml-auto p-1 rounded hover:bg-[var(--bg-tertiary)] transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {navItems.map((item, i) => {
          if (item.divider) {
            return (
              <div
                key={`div-${i}`}
                className="my-1.5 mx-1 border-t"
                style={{ borderColor: 'var(--border)' }}
              />
            )
          }
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={isMobile ? handleMobileNav : undefined}
              title={!isMobile && collapsed ? item.label : undefined}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors',
                  !isMobile && collapsed && 'justify-center',
                  isActive ? 'bg-brand-600 text-white' : 'hover:bg-[var(--bg-tertiary)]'
                )
              }
              style={({ isActive }) => ({ color: isActive ? '#fff' : 'var(--text-secondary)' })}
            >
              <Icon size={17} className="flex-shrink-0" />
              {showLabels && <span className="truncate">{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Usuario */}
      <div className="border-t p-2 flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        {showLabels ? (
          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <NavLink
              to="/perfil"
              onClick={isMobile ? handleMobileNav : undefined}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 px-2 py-2 transition-colors hover:bg-[var(--bg-secondary)]',
                  isActive && 'bg-[var(--bg-secondary)]'
                )
              }
            >
              <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {user?.nombre?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {user?.nombre}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {isSuperAdmin(user) ? 'Superadmin' : isAdmin ? 'Administrador' : 'Usuario'}
                </p>
              </div>
              <UserCircle size={14} style={{ color: 'var(--text-muted)' }} />
            </NavLink>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-red-400 hover:text-red-500 transition-colors border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              <LogOut size={13} /> Cerrar sesión
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <NavLink
              to="/perfil"
              title="Mi perfil"
              className="w-full flex justify-center p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {user?.nombre?.charAt(0).toUpperCase()}
                </span>
              </div>
            </NavLink>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="w-full flex justify-center p-2 rounded-lg hover:bg-red-50 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <LogOut size={17} />
            </button>
          </div>
        )}
      </div>
    </>
  )

  // ── Móvil: overlay + menú hamburguesa ──
  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="fixed top-3 left-3 z-50 p-2 rounded-lg shadow-lg"
          style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <aside
          className={clsx(
            'fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300 ease-in-out',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          style={{ backgroundColor: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}
        >
          {renderContent()}
        </aside>
      </>
    )
  }

  // ── Desktop: sidebar lateral colapsable ──
  return (
    <aside
      className={clsx(
        'flex flex-col h-screen sticky top-0 border-r transition-all duration-200 z-20 flex-shrink-0',
        collapsed ? 'w-[60px]' : 'w-56'
      )}
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      {renderContent()}
    </aside>
  )
}