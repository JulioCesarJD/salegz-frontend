import { useState } from 'react'
import { DollarSign, TrendingUp, Package, AlertTriangle, FileText, Users } from 'lucide-react'
import { usePermiso } from '../hooks/usePermiso'
import { useVentasRango, useProductosMasVendidos, useInventarioBajoMinimo, useCxCPendientes, useGastosPeriodo } from '../hooks/useReportes'
import { useProductos } from '../hooks/useProductos'
import { localDate } from '../utils/date'
import { fmt } from '../utils/format'

function DateRange({ desde, hasta, onDesde, onHasta }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div>
        <label className="label">Desde</label>
        <input type="date" className="input w-40" value={desde} onChange={e => onDesde(e.target.value)} />
      </div>
      <div>
        <label className="label">Hasta</label>
        <input type="date" className="input w-40" value={hasta} onChange={e => onHasta(e.target.value)} />
      </div>
    </div>
  )
}

const sumar = (items = [], campo) =>
  items.reduce((acc, item) => acc + (Number(item[campo]) || 0), 0)

export function ReportesPage() {
  const { puedeVer } = usePermiso()
  const puedeAcceder = puedeVer('verReportes')

  const today = new Date()
  const [desde, setDesde] = useState(localDate(new Date(today.getFullYear(), today.getMonth(), 1)))
  const [hasta, setHasta] = useState(localDate(today))

  const { data: ventas = [] } = useVentasRango(desde, hasta)
  const { data: cxc = [] } = useCxCPendientes()
  const { data: stockBajo = [] } = useInventarioBajoMinimo()
  const { data: gastos = [] } = useGastosPeriodo(desde, hasta)
  const { data: tops = [] } = useProductosMasVendidos(desde, hasta)
  const { data: productos = [] } = useProductos({ pageSize: 1000 })

  if (!puedeAcceder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold mb-2">
            Acceso Denegado
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            No tienes permisos para acceder a reportes
          </p>
        </div>
      </div>
    )
  }

  // ── Agregados reales ──
  const totalVendido = sumar(ventas, 'total')
  const totalItbis = sumar(ventas, 'itbis')
  const totalFacturas = sumar(ventas, 'cantidad')
  const totalPorCobrar = sumar(cxc, 'saldoPendiente')
  const totalGastos = sumar(gastos, 'total')

  const inventario = productos.reduce(
    (acc, p) => {
      const cantidad = Number(p.cantidad) || 0
      acc.totalProductos += 1
      acc.valorCosto += cantidad * (Number(p.costo) || 0)
      acc.valorPrecio1 += cantidad * (Number(p.precio1) || 0)
      return acc
    },
    { totalProductos: 0, valorCosto: 0, valorPrecio1: 0 }
  )

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reportes</h1>
          <p className="page-sub">Análisis del negocio</p>
        </div>
      </div>

      <DateRange
        desde={desde}
        hasta={hasta}
        onDesde={setDesde}
        onHasta={setHasta}
      />

      {/* Ventas */}
      <div>
        <h2
          className="text-sm font-bold uppercase tracking-wide mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Ventas del período
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'Total vendido',
              value: fmt(totalVendido),
              color: 'text-green-500',
              bg: 'bg-green-50  dark:bg-green-900/20',
              icon: DollarSign,
            },
            {
              label: 'ITBIS generado',
              value: fmt(totalItbis),
              color: 'text-purple-500',
              bg: 'bg-purple-50 dark:bg-purple-900/20',
              icon: DollarSign,
            },
            {
              label: 'Facturas',
              value: totalFacturas,
              color: 'text-blue-500',
              bg: 'bg-blue-50   dark:bg-blue-900/20',
              icon: FileText,
            },
            {
              label: 'Por cobrar',
              value: fmt(totalPorCobrar),
              color: 'text-yellow-500',
              bg: 'bg-yellow-50 dark:bg-yellow-900/20',
              icon: TrendingUp,
            },
            {
              label: 'Clientes con saldo',
              value: cxc.length,
              color: 'text-orange-500',
              bg: 'bg-orange-50 dark:bg-orange-900/20',
              icon: Users,
            },
            {
              label: 'Días con ventas',
              value: ventas.length,
              color: 'var(--text-primary)',
              bg: 'bg-gray-100 dark:bg-gray-800',
              icon: FileText,
            },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className="card flex items-center gap-3">
              <div className={`p-2.5 rounded-xl flex-shrink-0 ${bg}`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {label}
                </p>
                <p className={`text-lg font-extrabold tabular-nums ${color}`}>
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gastos */}
      <div>
        <h2
          className="text-sm font-bold uppercase tracking-wide mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Gastos del período
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="card flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20">
              <DollarSign size={18} className="text-red-500" />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Total gastos
              </p>
              <p className="text-lg font-extrabold text-red-500 tabular-nums">
                {fmt(totalGastos)}
              </p>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800">
              <FileText size={18} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Días con gastos
              </p>
              <p
                className="text-lg font-extrabold tabular-nums"
                style={{ color: 'var(--text-primary)' }}
              >
                {gastos.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inventario */}
      <div>
        <h2
          className="text-sm font-bold uppercase tracking-wide mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Inventario
        </h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="card">
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              Valor a costo
            </p>
            <p
              className="text-xl font-extrabold tabular-nums"
              style={{ color: 'var(--text-primary)' }}
            >
              {fmt(inventario.valorCosto)}
            </p>
          </div>
          <div className="card">
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              Valor a precio 1
            </p>
            <p className="text-xl font-extrabold text-green-500 tabular-nums">
              {fmt(inventario.valorPrecio1)}
            </p>
          </div>
          <div className="card">
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              Productos stock bajo
            </p>
            <p className="text-xl font-extrabold text-red-500">
              {stockBajo.length}
            </p>
          </div>
        </div>

        {stockBajo.length > 0 && (
          <div className="tbl-wrap">
            <table className="tbl table-fixed w-full">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th className="w-24 text-right">Stock</th>
                  <th className="w-24 text-right">Mínimo</th>
                  <th className="w-28 text-right">Faltante</th>
                </tr>
              </thead>
              <tbody>
                {stockBajo.map((p) => (
                  <tr key={p.productoId}>
                    <td>
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          size={14}
                          className="text-red-500 flex-shrink-0"
                        />
                        <span className="font-medium text-sm">
                          {p.descripcion}
                        </span>
                      </div>
                    </td>
                    <td className="text-right font-bold text-red-500 tabular-nums">
                      {p.cantidad}
                    </td>
                    <td
                      className="text-right text-sm tabular-nums"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {p.minimo}
                    </td>
                    <td className="text-right font-semibold text-sm tabular-nums">
                      {Math.max((Number(p.minimo) || 0) - (Number(p.cantidad) || 0), 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cuentas por cobrar */}
      {cxc.length > 0 && (
        <div>
          <h2
            className="text-sm font-bold uppercase tracking-wide mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            Cuentas por cobrar{' '}
            <span className="badge badge-yellow ml-2">{cxc.length}</span>
          </h2>
          <div className="tbl-wrap">
            <table className="tbl table-fixed w-full">
              <thead>
                <tr>
                  <th className="w-16">#</th>
                  <th>Cliente</th>
                  <th className="w-40 text-right">Saldo pendiente</th>
                </tr>
              </thead>
              <tbody>
                {cxc.map((c) => (
                  <tr key={c.clienteId}>
                    <td
                      className="font-bold text-sm"
                      style={{ color: 'var(--brand)' }}
                    >
                      {c.clienteId}
                    </td>
                    <td className="font-medium text-sm truncate">
                      {c.nombre || 'Cliente'}
                    </td>
                    <td className="text-right font-bold text-sm text-red-500 tabular-nums">
                      {fmt(c.saldoPendiente)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
          Productos más vendidos
        </h2>
        {tops.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sin datos</p>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>#</th><th>Producto</th><th className="text-right">Cantidad</th><th className="text-right">Total</th></tr></thead>
              <tbody>
                {tops.slice(0, 10).map((p, i) => (
                  <tr key={p.productoId || i}>
                    <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td className="font-medium">{p.descripcion}</td>
                    <td className="text-right font-semibold">{p.cantidadVendida}</td>
                    <td className="text-right font-semibold">{fmt(p.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
