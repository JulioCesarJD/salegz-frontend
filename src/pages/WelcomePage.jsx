import { useNavigate } from 'react-router-dom'
import { FileText, Users, Package, Tag, TrendingUp, ClipboardList, Zap } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { usePermiso } from '../hooks/usePermiso'
import { useInventarioBajoMinimo } from '../hooks/useReportes'

const ACCESOS = [
  { to: '/facturas',     label: 'Facturas',     desc: 'Crear y gestionar facturas',  icon: FileText,      color: 'bg-green-50  dark:bg-green-900/20  text-green-600', permission: 'verFacturas' },
  { to: '/cotizaciones', label: 'Cotizaciones', desc: 'Generar cotizaciones',         icon: ClipboardList, color: 'bg-blue-50   dark:bg-blue-900/20   text-blue-600', permission: 'verCotizaciones' },
  { to: '/clientes',     label: 'Clientes',     desc: 'Ver y registrar clientes',     icon: Users,         color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600', permission: 'verClientes' },
  { to: '/productos',    label: 'Productos',    desc: 'Consultar inventario',         icon: Package,       color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600', permission: 'verProductos' },
  { to: '/categorias',   label: 'Categorías',   desc: 'Administrar categorías',       icon: Tag,           color: 'bg-pink-50   dark:bg-pink-900/20   text-pink-600', permission: 'verCategorias' },
  { to: '/cuadres',      label: 'Cuadres',      desc: 'Registrar cuadres de caja',    icon: TrendingUp,    color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600', permission: 'verCuadres' },
]

export function WelcomePage() {
  const { user }  = useAuthStore()
  const navigate  = useNavigate()
  const { puedeVer } = usePermiso()

  // ── Fechas locales DENTRO del componente ──
  const today = new Date()
  const hora  = today.getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches'

  const { data: stockBajo = [] } = useInventarioBajoMinimo()

  return (
    <div className="space-y-6">

      {/* Header saludo */}
      <div className="rounded-2xl p-6 flex items-center justify-between overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium">{saludo} 👋</p>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            {user?.nombre?.split(' ')[0] || 'Usuario'}
          </h1>
          <p className="text-white/60 text-sm mt-1">
            {today.toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <Zap size={28} className="text-white" />
        </div>
      </div>
 

      {/* Accesos rápidos */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
          Acceso rápido
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ACCESOS.filter(a => !a.permission || puedeVer(a.permission)).map(a => {
            const Icon = a.icon
            return (
              <button key={a.to} onClick={() => navigate(a.to)}
                className="card text-left hover:scale-[1.02] active:scale-[0.98] transition-all duration-150">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${a.color}`}>
                  <Icon size={20} />
                </div>
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{a.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{a.desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Stock bajo warning */}
      {stockBajo.length > 0 && (
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 p-4 flex items-start gap-3"
          style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Package size={15} className="text-red-500" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-red-600 dark:text-red-400">
              {stockBajo.length} producto{stockBajo.length > 1 ? 's' : ''} con stock bajo
            </p>
            <div className="mt-2 space-y-1">
              {stockBajo.slice(0, 4).map(p => (
                <div key={p.productoId} className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>{p.descripcion}</span>
                  <span className="font-semibold text-red-500">Stock: {p.cantidad}</span>
                </div>
              ))}
              {stockBajo.length > 4 && <p className="text-xs text-red-400">+{stockBajo.length - 4} más...</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
