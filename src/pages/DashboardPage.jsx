import { DollarSign, Users, AlertTriangle, TrendingUp, Package, ShoppingBag, Calendar, HandCoins } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useVentasRango, useCxCPendientes, useInventarioBajoMinimo } from '../hooks/useReportes'
import { useProductos } from '../hooks/useProductos'
import { useClientes } from '../hooks/useClientes'
import { localDate } from '../utils/date'
import { fmt } from '../utils/format'

function StatCard({ title, value, sub, icon: Icon, color }) {
  const colors = {
    green: 'bg-green-50  dark:bg-green-900/20  text-green-600  dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-50    dark:bg-red-900/20    text-red-600    dark:text-red-400',
    blue: 'bg-blue-50   dark:bg-blue-900/20   text-blue-600   dark:text-blue-400',
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

const sumarVentas = (dias = []) =>
  dias.reduce(
    (acc, d) => ({
      total: acc.total + (Number(d.total) || 0),
      itbis: acc.itbis + (Number(d.itbis) || 0),
      cantidad: acc.cantidad + (Number(d.cantidad) || 0),
    }),
    { total: 0, itbis: 0, cantidad: 0 }
  )

export function DashboardPage() {
  const { user } = useAuthStore()
  // ── Fechas locales DENTRO del componente ──
  const today = new Date()
  const hoy = localDate(today)
  const inicioMes = localDate(new Date(today.getFullYear(), today.getMonth(), 1))

  const hora = today.getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches'

  // ── Reportes reales ──
  const { data: ventasHoyRango = [] } = useVentasRango(hoy, hoy)
  const { data: ventasMesRango = [] } = useVentasRango(inicioMes, hoy)
  const { data: cxc = [] } = useCxCPendientes()
  const { data: stockBajo = [] } = useInventarioBajoMinimo()

  // ── Catálogos reales (se agregan localmente) ──
  const { data: clientes = [] } = useClientes({ pageSize: 1000 })
  const { data: productos = [] } = useProductos({ pageSize: 1000 })

  const ventasHoy = sumarVentas(ventasHoyRango)
  const ventasMes = sumarVentas(ventasMesRango)

  const inv = productos.reduce(
    (acc, p) => {
      const cantidad = Number(p.cantidad) || 0
      acc.totalProductos += 1
      acc.valorTotalCosto += cantidad * (Number(p.costo) || 0)
      acc.valorTotalPrecio1 += cantidad * (Number(p.precio1) || 0)
      return acc
    },
    { totalProductos: 0, valorTotalCosto: 0, valorTotalPrecio1: 0 }
  )

  const totalPorCobrar = cxc.reduce((acc, c) => acc + (Number(c.saldoPendiente) || 0), 0)
  const margen = inv.valorTotalPrecio1 > 0
    ? (((inv.valorTotalPrecio1 - inv.valorTotalCosto) / inv.valorTotalPrecio1) * 100).toFixed(1)
    : 0
  const promedioFactura = ventasHoy.cantidad > 0 ? ventasHoy.total / ventasHoy.cantidad : 0

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header saludo estilo Welcome */}
      <div
        className="rounded-2xl p-4 sm:p-6 flex items-center justify-between overflow-hidden relative mb-4 sm:mb-6"
        style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10">
          <p className="text-white/70 text-xs sm:text-sm font-medium">
            {saludo} 👋
          </p>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {user?.nombre || 'Usuario'}
          </h1>

          <p className="text-white/60 text-xs sm:text-sm mt-1 capitalize">
            {today.toLocaleDateString('es-DO', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <TrendingUp size={24} className="text-white" />
        </div>
      </div>

      {/* ── Ventas de HOY ── */}
      <div>
        <h2
          className="text-xs sm:text-sm font-bold uppercase tracking-wide mb-2 sm:mb-3 flex items-center gap-2"
          style={{ color: 'var(--text-muted)' }}
        >
          <Calendar size={14} /> Ventas de hoy
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Facturado hoy"
            value={fmt(ventasHoy.total)}
            sub={`${ventasHoy.cantidad || 0} facturas`}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Facturas hoy"
            value={ventasHoy.cantidad || 0}
            sub="Transacciones"
            icon={TrendingUp}
            color="blue"
          />
          <StatCard
            title="Promedio factura"
            value={fmt(promedioFactura)}
            sub="Por transacción"
            icon={HandCoins}
            color="yellow"
          />
          <StatCard
            title="ITBIS hoy"
            value={fmt(ventasHoy.itbis)}
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
          style={{ color: 'var(--text-muted)' }}
        >
          Ventas del mes —{' '}
          {today.toLocaleDateString('es-DO', {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Total del mes"
            value={fmt(ventasMes.total)}
            sub={`${ventasMes.cantidad || 0} facturas`}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Por cobrar"
            value={fmt(totalPorCobrar)}
            sub={`${cxc.length} clientes pendientes`}
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

      {/* ── Nuevos módulos ── */}
      <div>
        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wide mb-2 sm:mb-3" style={{ color: 'var(--text-muted)' }}>
          Otros indicadores
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard title="Productos" value={inv.totalProductos} sub="En inventario" icon={Package} color="indigo" />
          <StatCard title="Clientes" value={clientes.length} sub="Registrados" icon={Users} color="blue" />
          <StatCard title="Facturas del mes" value={ventasMes.cantidad || 0} sub="Transacciones" icon={TrendingUp} color="green" />
          <StatCard title="ITBIS del mes" value={fmt(ventasMes.itbis)} sub="Impuesto generado" icon={DollarSign} color="yellow" />
        </div>
      </div>

      {/* ── Valor del inventario ── */}
      <div>
        <h2
          className="text-xs sm:text-sm font-bold uppercase tracking-wide mb-2 sm:mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Valor del inventario
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="card animate-slide-up">
            <div className="flex items-start justify-between mb-3">
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--text-muted)' }}
              >
                Valor a costo
              </p>
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <ShoppingBag size={16} className="text-purple-500" />
              </div>
            </div>
            <p
              className="text-xl sm:text-2xl font-extrabold tabular-nums break-words"
              style={{ color: 'var(--text-primary)' }}
            >
              {fmt(inv.valorTotalCosto)}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Lo que invertiste en stock
            </p>
          </div>
          <div className="card animate-slide-up">
            <div className="flex items-start justify-between mb-3">
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--text-muted)' }}
              >
                Valor a precio 1
              </p>
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                <DollarSign size={16} className="text-green-500" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-green-500 tabular-nums break-words">
              {fmt(inv.valorTotalPrecio1)}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Potencial · {inv.totalProductos} productos
            </p>
          </div>
          <div className="card animate-slide-up">
            <div className="flex items-start justify-between mb-3">
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--text-muted)' }}
              >
                Ganancia potencial
              </p>
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                <Package size={16} className="text-indigo-500" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-indigo-500 tabular-nums break-words">
              {fmt(inv.valorTotalPrecio1 - inv.valorTotalCosto)}
            </p>
            <p
              className="text-xs mt-1 mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              Margen estimado:{' '}
              <strong className="text-indigo-500">{margen}%</strong>
            </p>
            <div
              className="w-full rounded-full h-1.5"
              style={{ backgroundColor: 'var(--bg-tertiary)' }}
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
            <h3 className="font-bold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
              Cuentas por cobrar
            </h3>
            {cxc.length > 0 && (
              <span className="badge badge-yellow text-xs sm:text-sm">{cxc.length}</span>
            )}
          </div>
          {cxc.length === 0 ? (
            <p
              className="text-sm text-center py-6 sm:py-8"
              style={{ color: 'var(--text-muted)' }}
            >
              Sin pendientes
            </p>
          ) : (
            <div className="space-y-2 overflow-x-auto">
              {cxc.slice(0, 6).map((c) => (
                <div
                  key={c.clienteId}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--bg-tertiary)' }}
                >
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {c.nombre || 'Cliente'}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Cliente #{c.clienteId}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-bold text-red-500 tabular-nums">
                      {fmt(c.saldoPendiente)}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      saldo pendiente
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
              Productos con stock bajo
            </h3>
            {stockBajo.length > 0 && (
              <span className="badge badge-red text-xs sm:text-sm">{stockBajo.length}</span>
            )}
          </div>
          {stockBajo.length === 0 ? (
            <p
              className="text-sm text-center py-6 sm:py-8"
              style={{ color: 'var(--text-muted)' }}
            >
              Todos los productos OK
            </p>
          ) : (
            <div className="space-y-2 overflow-x-auto">
              {stockBajo.slice(0, 6).map((p) => (
                <div
                  key={p.productoId}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--bg-tertiary)' }}
                >
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {p.descripcion}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Producto #{p.productoId}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-bold text-red-500">
                      {p.cantidad}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
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
  )
}
