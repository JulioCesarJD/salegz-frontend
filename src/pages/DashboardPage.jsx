import { useQuery } from '@tanstack/react-query'
import { DollarSign, Users, AlertTriangle, TrendingUp, Package, ShoppingBag, Calendar } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'

const fmt = (v) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v || 0)

const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

function StatCard({ title, value, sub, icon: Icon, color }) {
  const colors = {
    green:  'bg-green-50  dark:bg-green-900/20  text-green-600  dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    red:    'bg-red-50    dark:bg-red-900/20    text-red-600    dark:text-red-400',
    blue:   'bg-blue-50   dark:bg-blue-900/20   text-blue-600   dark:text-blue-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
  }
  return (
    <div className="card flex items-center gap-3 sm:gap-4 animate-slide-up">
      <div className={`p-2 sm:p-3 rounded-xl flex-shrink-0 ${colors[color]}`}>
        <Icon size={20} className="sm:w-[22px] sm:h-[22px]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide truncate" style={{ color: 'var(--text-muted)' }}>{title}</p>
        <p className="text-xl sm:text-2xl font-extrabold mt-0.5 tabular-nums truncate" style={{ color: 'var(--text-primary)' }}>{value}</p>
        {sub && <p className="text-[10px] sm:text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuthStore()
  // ── Fechas locales DENTRO del componente ──
  const today = new Date()
  const hoy   = localDate(today)
  const desde = localDate(new Date(today.getFullYear(), today.getMonth(), 1))

  const { data: ventasHoy }      = useQuery({
    queryKey: ['ventas-hoy', hoy],
    queryFn:  () => api.get(`/api/reportes/ventas?desde=${hoy}&hasta=${hoy}`).then(r => r.data),
  })
  const { data: ventasMes }      = useQuery({
    queryKey: ['ventas-mes', desde, hoy],
    queryFn:  () => api.get(`/api/reportes/ventas?desde=${desde}&hasta=${hoy}`).then(r => r.data),
  })
  const { data: cxc = [] }       = useQuery({ queryKey: ['cxc'],        queryFn: () => api.get('/api/reportes/cuentas-cobrar').then(r => r.data) })
  const { data: stockBajo = [] } = useQuery({ queryKey: ['stock-bajo'], queryFn: () => api.get('/api/productos/stock-bajo').then(r => r.data) })
  const { data: clientes = [] }  = useQuery({ queryKey: ['clientes'],   queryFn: () => api.get('/api/clientes').then(r => r.data) })
  const { data: inv }            = useQuery({ queryKey: ['inv-resumen'],queryFn: () => api.get('/api/reportes/inventario/resumen').then(r => r.data) })

  const margen = inv?.valorTotalPrecio1 > 0
    ? (((inv.valorTotalPrecio1 - inv.valorTotalCosto) / inv.valorTotalPrecio1) * 100).toFixed(1)
    : 0

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header con gradiente y fondo responsivo */}
      <div
        className="relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6"
        style={{
          background: "linear-gradient(135deg, #16a34a, #22c55e)",
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "25px 25px",
          }}
        />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Dashboard</h1>
              <p className="text-white/70 text-xs sm:text-sm mt-1 capitalize">
                {today.toLocaleDateString("es-DO", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-white text-xs sm:text-sm">
                📊 Resumen general
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Ventas de HOY ── */}
      <div>
        <h2
          className="text-xs sm:text-sm font-bold uppercase tracking-wide mb-2 sm:mb-3 flex items-center gap-2"
          style={{ color: "var(--text-muted)" }}
        >
          <Calendar size={14} /> Ventas de hoy
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Facturado hoy"
            value={fmt(ventasHoy?.totalVentas)}
            sub={`${ventasHoy?.cantidadFacturas || 0} facturas`}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Cobrado hoy"
            value={fmt(ventasHoy?.totalCobrado)}
            sub="Efectivo recibido"
            icon={TrendingUp}
            color="blue"
          />
          <StatCard
            title="Pendiente hoy"
            value={fmt(ventasHoy?.totalPendiente)}
            sub="Sin cobrar"
            icon={AlertTriangle}
            color="yellow"
          />
          <StatCard
            title="ITBS hoy"
            value={fmt(ventasHoy?.totalITBS)}
            sub="Impuesto generado"
            icon={DollarSign}
            color="indigo"
          />
        </div>
      </div>

      {/* ── Ventas del MES ── */}
      <div>
        <h2
          className="text-xs sm:text-sm font-bold uppercase tracking-wide mb-2 sm:mb-3"
          style={{ color: "var(--text-muted)" }}
        >
          Ventas del mes —{" "}
          {today.toLocaleDateString("es-DO", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Total del mes"
            value={fmt(ventasMes?.totalVentas)}
            sub={`${ventasMes?.cantidadFacturas || 0} facturas`}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Por cobrar"
            value={fmt(ventasMes?.totalPendiente)}
            sub={`${cxc.length} pendientes`}
            icon={TrendingUp}
            color="yellow"
          />
          <StatCard
            title="Stock bajo"
            value={stockBajo.length}
            sub="Productos bajo mínimo"
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            title="Clientes"
            value={clientes.length}
            sub="Registrados"
            icon={Users}
            color="blue"
          />
        </div>
      </div>

      {/* ── Valor del inventario ── */}
      <div>
        <h2
          className="text-xs sm:text-sm font-bold uppercase tracking-wide mb-2 sm:mb-3"
          style={{ color: "var(--text-muted)" }}
        >
          Valor del inventario
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="card animate-slide-up">
            <div className="flex items-start justify-between mb-3">
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                Valor a costo
              </p>
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <ShoppingBag size={16} className="text-purple-500" />
              </div>
            </div>
            <p
              className="text-xl sm:text-2xl font-extrabold tabular-nums break-words"
              style={{ color: "var(--text-primary)" }}
            >
              {fmt(inv?.valorTotalCosto)}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Lo que invertiste en stock
            </p>
          </div>
          <div className="card animate-slide-up">
            <div className="flex items-start justify-between mb-3">
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                Valor a precio 1
              </p>
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                <DollarSign size={16} className="text-green-500" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-green-500 tabular-nums break-words">
              {fmt(inv?.valorTotalPrecio1)}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Potencial · {inv?.totalProductos || 0} productos
            </p>
          </div>
          <div className="card animate-slide-up">
            <div className="flex items-start justify-between mb-3">
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                Ganancia potencial
              </p>
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                <Package size={16} className="text-indigo-500" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-indigo-500 tabular-nums break-words">
              {fmt((inv?.valorTotalPrecio1 || 0) - (inv?.valorTotalCosto || 0))}
            </p>
            <p
              className="text-xs mt-1 mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              Margen estimado:{" "}
              <strong className="text-indigo-500">{margen}%</strong>
            </p>
            <div
              className="w-full rounded-full h-1.5"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            >
              <div
                className="h-1.5 rounded-full bg-indigo-500 transition-all duration-700"
                style={{ width: `${Math.min(margen, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Tablas responsivas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm sm:text-base" style={{ color: "var(--text-primary)" }}>
              Cuentas por cobrar
            </h3>
            {cxc.length > 0 && (
              <span className="badge badge-yellow text-xs sm:text-sm">{cxc.length}</span>
            )}
          </div>
          {cxc.length === 0 ? (
            <p
              className="text-sm text-center py-6 sm:py-8"
              style={{ color: "var(--text-muted)" }}
            >
              Sin pendientes 
            </p>
          ) : (
            <div className="space-y-2 overflow-x-auto">
              {cxc.slice(0, 6).map((c) => (
                <div
                  key={c.facturaId}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 rounded-lg"
                  style={{ backgroundColor: "var(--bg-tertiary)" }}
                >
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {c.nombreCliente}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Factura #{c.facturaId}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-bold text-red-500 tabular-nums">
                      {fmt(c.pendiente)}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      de {fmt(c.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm sm:text-base" style={{ color: "var(--text-primary)" }}>
              Productos con stock bajo
            </h3>
            {stockBajo.length > 0 && (
              <span className="badge badge-red text-xs sm:text-sm">{stockBajo.length}</span>
            )}
          </div>
          {stockBajo.length === 0 ? (
            <p
              className="text-sm text-center py-6 sm:py-8"
              style={{ color: "var(--text-muted)" }}
            >
              Todos los productos OK
            </p>
          ) : (
            <div className="space-y-2 overflow-x-auto">
              {stockBajo.slice(0, 6).map((p) => (
                <div
                  key={p.productoId}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 rounded-lg"
                  style={{ backgroundColor: "var(--bg-tertiary)" }}
                >
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {p.descripcion}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {p.categoria}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-bold text-red-500">
                      {p.cantidad}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      mín: {p.minimo}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}