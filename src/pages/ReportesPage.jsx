import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DollarSign, TrendingUp, Package, AlertTriangle, FileText } from 'lucide-react'
import api from '../lib/api'

const fmt = (v) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v || 0)

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

export function ReportesPage() {
  const today  = new Date()
  const [desde, setDesde] = useState(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0])
  const [hasta, setHasta] = useState(today.toISOString().split('T')[0])

  const { data: ventas }        = useQuery({ queryKey: ['r-ventas', desde, hasta],    queryFn: () => api.get(`/api/reportes/ventas?desde=${desde}&hasta=${hasta}`).then(r => r.data) })
  const { data: cxc = [] }      = useQuery({ queryKey: ['r-cxc'],                     queryFn: () => api.get('/api/reportes/cuentas-cobrar').then(r => r.data) })
  const { data: inventario = [] }= useQuery({ queryKey: ['r-inventario'],              queryFn: () => api.get('/api/reportes/inventario').then(r => r.data) })
  const { data: gastos }        = useQuery({ queryKey: ['r-gastos', desde, hasta],    queryFn: () => api.get(`/api/reportes/gastos?desde=${desde}&hasta=${hasta}`).then(r => r.data) })
  const { data: invRes }        = useQuery({ queryKey: ['r-inv-resumen'],             queryFn: () => api.get('/api/reportes/inventario/resumen').then(r => r.data) })

  const stockBajo = inventario.filter(p => p.stockBajo)

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
          style={{ color: "var(--text-muted)" }}
        >
          Ventas del período
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Total vendido",
              value: fmt(ventas?.totalVentas),
              color: "text-green-500",
              bg: "bg-green-50  dark:bg-green-900/20",
              icon: DollarSign,
            },
            {
              label: "Total cobrado",
              value: fmt(ventas?.totalCobrado),
              color: "text-blue-500",
              bg: "bg-blue-50   dark:bg-blue-900/20",
              icon: TrendingUp,
            },
            {
              label: "Por cobrar",
              value: fmt(ventas?.totalPendiente),
              color: "text-yellow-500",
              bg: "bg-yellow-50 dark:bg-yellow-900/20",
              icon: FileText,
            },
            {
              label: "ITBS generado",
              value: fmt(ventas?.totalITBS),
              color: "text-purple-500",
              bg: "bg-purple-50 dark:bg-purple-900/20",
              icon: DollarSign,
            },
            {
              label: "Facturas activas",
              value: ventas?.cantidadFacturas || 0,
              color: "var(--text-primary)",
              bg: "bg-gray-100 dark:bg-gray-800",
              icon: FileText,
            },
            {
              label: "Canceladas",
              value: ventas?.facturasCanceladas || 0,
              color: "text-red-500",
              bg: "bg-red-50 dark:bg-red-900/20",
              icon: FileText,
            },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className="card flex items-center gap-3">
              <div className={`p-2.5 rounded-xl flex-shrink-0 ${bg}`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
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
          style={{ color: "var(--text-muted)" }}
        >
          Gastos del período
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="card flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20">
              <DollarSign size={18} className="text-red-500" />
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Total gastos
              </p>
              <p className="text-lg font-extrabold text-red-500 tabular-nums">
                {fmt(gastos?.totalGastos)}
              </p>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800">
              <FileText size={18} style={{ color: "var(--text-muted)" }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Registros
              </p>
              <p
                className="text-lg font-extrabold tabular-nums"
                style={{ color: "var(--text-primary)" }}
              >
                {gastos?.cantidadGastos || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inventario */}
      <div>
        <h2
          className="text-sm font-bold uppercase tracking-wide mb-3"
          style={{ color: "var(--text-muted)" }}
        >
          Inventario
        </h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="card">
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
              Valor a costo
            </p>
            <p
              className="text-xl font-extrabold tabular-nums"
              style={{ color: "var(--text-primary)" }}
            >
              {fmt(invRes?.valorTotalCosto)}
            </p>
          </div>
          <div className="card">
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
              Valor a precio 1
            </p>
            <p className="text-xl font-extrabold text-green-500 tabular-nums">
              {fmt(invRes?.valorTotalPrecio1)}
            </p>
          </div>
          <div className="card">
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
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
                  <th className="w-32">Categoría</th>
                  <th className="w-20 text-right">Stock</th>
                  <th className="w-20 text-right">Mínimo</th>
                  <th className="w-32 text-right">Precio 1</th>
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
                    <td>
                      <span className="badge badge-gray">{p.categoria}</span>
                    </td>
                    <td className="text-right font-bold text-red-500 tabular-nums">
                      {p.cantidad}
                    </td>
                    <td
                      className="text-right text-sm tabular-nums"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {p.minimo}
                    </td>
                    <td className="text-right font-semibold text-sm tabular-nums">
                      {fmt(p.precio1)}
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
            style={{ color: "var(--text-muted)" }}
          >
            Cuentas por cobrar{" "}
            <span className="badge badge-yellow ml-2">{cxc.length}</span>
          </h2>
          <div className="tbl-wrap">
            <table className="tbl table-fixed w-full">
              <thead>
                <tr>
                  <th className="w-12">#</th>
                  <th className="w-44">Cliente</th>
                  <th className="w-28">Fecha</th>
                  <th className="w-32 text-right">Total</th>
                  <th className="w-32 text-right">Pagado</th>
                  <th className="w-32 text-right">Pendiente</th>
                </tr>
              </thead>
              <tbody>
                {cxc.map((c) => (
                  <tr key={c.facturaId}>
                    <td
                      className="font-bold text-sm"
                      style={{ color: "var(--brand)" }}
                    >
                      #{c.facturaId}
                    </td>
                    <td className="font-medium text-sm truncate">
                      {c.nombreCliente}
                    </td>
                    <td
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {new Date(c.fecha).toLocaleDateString("es-DO")}
                    </td>
                    <td className="text-start font-semibold text-sm tabular-nums">
                      {fmt(c.total)}
                    </td>
                    <td className="text-start text-sm text-green-500 tabular-nums">
                      {fmt(c.pagado)}
                    </td>
                    <td className="text-start font-bold text-sm text-red-500 tabular-nums">
                      {fmt(c.pendiente)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
