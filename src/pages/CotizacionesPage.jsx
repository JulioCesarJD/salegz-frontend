import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Eye, ArrowRightCircle, ClipboardList, Printer } from 'lucide-react'
import { useForm, useFieldArray } from 'react-hook-form'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { printCotizacion } from '../utils/printFactura' 

const fmt = (v) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v || 0)

const TIPO_COMPROBANTE = [
  { value: 0, label: 'Fiscal (B01)' },
  { value: 1, label: 'Consumidor Final (B02)' },
  { value: 2, label: 'Régimen Especial (B14)' },
  { value: 3, label: 'Gubernamental (B15)' },
]

// ── Ver detalle cotización ───────────────────────────────────────
function CotizacionDetalle({ cotizacionId, onClose, onConvertir, converting }) {
  const { data: c, isLoading } = useQuery({
    queryKey: ['cotizacion', cotizacionId],
    queryFn:  () => api.get(`/api/cotizaciones/${cotizacionId}`).then(r => r.data),
  })
  const { data: empresa } = useQuery({ queryKey: ['empresa'],   queryFn: () => api.get('/api/empresa').then(r => r.data) })
  const { data: control } = useQuery({ queryKey: ['controles'], queryFn: () => api.get('/api/Empresa/control').then(r => r.data) })

  const handlePrint = () => printCotizacion(c, empresa, control)

  const [confirmConvertir, setConfirmConvertir] = useState(false)
  const [tipoPago, setTipoPago] = useState('Efectivo')
  const [tipoComprobante, setTipoComprobante] = useState(1) 

  if (isLoading) return (
    <div className="modal-overlay">
      <div className="modal-box max-w-2xl flex items-center justify-center py-12">
        <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
      </div>
    </div>
  )

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Cotización #{c?.cotizacionId}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {new Date(c?.fecha).toLocaleDateString('es-DO', { dateStyle: 'full' })}
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            ['Cliente',  c?.nombreCliente || 'Consumidor Final'],
            ['Usuario',  c?.usuario],
            ['Total',    fmt(c?.total)],
            ['ITBIS',    fmt(c?.itbis)],
          ].map(([l, v]) => (
            <div key={l} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{l}</p>
              <p className="font-semibold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{v || '—'}</p>
            </div>
          ))}
        </div>

        {/* Detalles */}
        <div className="tbl-wrap mb-5">
          <table className="tbl">
            <thead>
              <tr>
                <th>Producto</th>
                <th className="text-right w-20">Cant.</th>
                <th className="text-right w-28">ITBIS</th>
                <th className="text-right w-32">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {c?.detalles?.map((d, i) => (
                <tr key={i}>
                  <td className="font-medium">{d.producto}</td>
                  <td className="text-right tabular-nums">{d.cantidad}</td>
                  <td className="text-right tabular-nums">{fmt(d.itbis)}</td>
                  <td className="text-right font-semibold tabular-nums">{fmt(d.subTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="space-y-2 border-t pt-4 mb-5" style={{ borderColor: 'var(--border)' }}>
          {[
            ['Subtotal', fmt((c?.total || 0) - (c?.itbis || 0)), false],
            ['ITBIS',    fmt(c?.itbis),                          false],
            ['Total',    fmt(c?.total),                          true],
          ].map(([l, v, bold]) => (
            <div key={l} className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{l}</span>
              <span className={`tabular-nums ${bold ? 'text-xl font-extrabold' : 'text-sm font-medium'}`}
                style={{ color: bold ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Convertir a factura */}
        {!confirmConvertir ? (
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1">Cerrar</button>
            <button onClick={handlePrint} className="btn-ghost flex-1 border" style={{ borderColor: 'var(--border)' }}>
              <Printer size={15} /> Imprimir
            </button>
            <button onClick={() => setConfirmConvertir(true)} className="btn-primary flex-1">
              <ArrowRightCircle size={15} /> Convertir
            </button>
          </div>
        ) : (
          <div className="border rounded-xl p-4 space-y-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-tertiary)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Configurar factura
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Tipo de pago</label>
                <select className="input" value={tipoPago} onChange={e => setTipoPago(e.target.value)}>
                  {['Efectivo','Tarjeta','Transferencia','Cheque','Crédito'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Comprobante</label>
                <select className="input" value={tipoComprobante} onChange={e => setTipoComprobante(parseInt(e.target.value))}>
                  {TIPO_COMPROBANTE.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setConfirmConvertir(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button
                disabled={converting}
                onClick={() => onConvertir({
                  cotizacionId:    c.cotizacionId,
                  empresaId:       1,
                  tipoPago,
                  pagado:          0,
                  tarjeta:         tipoPago === 'Tarjeta',
                  tipoComprobante,
                })}
                className="btn-primary flex-1"
              >
                {converting ? 'Convirtiendo...' : `Crear factura por ${fmt(c?.total)}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Selector de precio ───────────────────────────────────────────
function PrecioSelectorModal({ producto, onSelect, onClose }) {
  const precios = [
    { label: 'Precio 1', value: producto.precio1 },
    { label: 'Precio 2', value: producto.precio2 },
    { label: 'Precio 3', value: producto.precio3 },
  ].filter(p => p.value > 0)

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-xs">
        <h2 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Seleccionar precio</h2>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{producto.descripcion}</p>
        <div className="space-y-2">
          {precios.map(p => (
            <button key={p.label} type="button" onClick={() => onSelect(p.value)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors hover:bg-[var(--bg-tertiary)] active:scale-95"
              style={{ borderColor: 'var(--border)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{p.label}</span>
              <span className="text-base font-extrabold" style={{ color: 'var(--brand)' }}>{fmt(p.value)}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={onClose} className="btn-secondary w-full mt-4 btn-sm">Cancelar</button>
      </div>
    </div>
  )
}

// ── Modal nueva cotización ───────────────────────────────────────
function NuevaCotizacionModal({ onClose, onSave, busy }) {
  const { user } = useAuthStore()
  const [clienteSearch,  setClienteSearch]  = useState('')
  const [productoSearch, setProductoSearch] = useState('')
  const [clienteSel,     setClienteSel]     = useState(null)
  const [precioModal,    setPrecioModal]    = useState(null)
  const [confirmCancel,  setConfirmCancel]  = useState(false)
  const itbsPct = 0.18

  const { register, handleSubmit, watch, control, formState: { isDirty } } = useForm({
    defaultValues: { detalles: [] },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'detalles' })

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes-search', clienteSearch],
    queryFn:  () => clienteSearch.length >= 2 ? api.get(`/api/clientes/search?q=${clienteSearch}`).then(r => r.data) : [],
    enabled: clienteSearch.length >= 2,
  })

  const { data: productos = [] } = useQuery({
    queryKey: ['productos-search', productoSearch],
    queryFn:  () => productoSearch.length >= 1 ? api.get(`/api/productos/search?q=${productoSearch}`).then(r => r.data) : [],
    enabled: productoSearch.length >= 1,
  })

  const detalles = watch('detalles')
  const subtotal = detalles.reduce((s, d) => s + parseFloat(d.cantidad||0)*parseFloat(d.precio||0), 0)
  const itbs     = detalles.reduce((s, d) => s + (Number(d.itbis)===1 ? parseFloat(d.cantidad||0)*parseFloat(d.precio||0)*itbsPct : 0), 0)
  const total    = subtotal + itbs

  const handleProductoClick = (p) => {
    const precios = [p.precio1, p.precio2, p.precio3].filter(v => v > 0)
    if (precios.length > 1) { setPrecioModal(p); setProductoSearch('') }
    else agregarProducto(p, p.precio1)
  }

  const agregarProducto = (p, precio) => {
    append({ productoId: p.productoId, descripcion: p.descripcion, cantidad: 1, precio, itbis: 0 })
    setProductoSearch('')
    setPrecioModal(null)
  }

  const closeWithConfirm = () => {
    if (isDirty || detalles?.length > 0 || clienteSel || clienteSearch || productoSearch) setConfirmCancel(true)
    else onClose()
  }

  const submit = (data) => {
    if (fields.length === 0) { toast.error('Agrega al menos un producto'); return }
    onSave({
      clienteId: clienteSel?.clienteId || null,
      usuarioId: user?.usuarioId,
      total,
      itbis: itbs,
      detalles: data.detalles.map(d => ({
        productoId: d.productoId,
        cantidad:   parseFloat(d.cantidad),
        subTotal:   parseFloat(d.cantidad) * parseFloat(d.precio),
        itbis:      Number(d.itbis)===1 ? parseFloat(d.cantidad)*parseFloat(d.precio)*itbsPct : 0,
      })),
    })
  }

  return (
    <>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeWithConfirm()}>
        <div className="modal-box max-w-5xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Nueva cotización</h2>
            <button onClick={closeWithConfirm} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
          </div>

          <form onSubmit={handleSubmit(submit)} className="space-y-5">

            {/* Cliente */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="label">Cliente (opcional)</label>
                {clienteSel ? (
                  <div className="input flex items-center justify-between">
                    <span className="text-sm font-medium">{clienteSel.nombre}</span>
                    <button type="button" onClick={() => setClienteSel(null)} className="text-red-400 hover:text-red-600">×</button>
                  </div>
                ) : (
                  <>
                    <input className="input" placeholder="Buscar cliente..." value={clienteSearch} onChange={e => setClienteSearch(e.target.value)} />
                    {clientes.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 rounded-lg border shadow-lg overflow-hidden"
                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        {clientes.map(c => (
                          <button key={c.clienteId} type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-tertiary)]"
                            onClick={() => { setClienteSel(c); setClienteSearch('') }}>
                            {c.nombre}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Info */}
              <div className="flex items-end">
                <div className="p-3 rounded-xl w-full" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Las cotizaciones se pueden convertir en facturas con un solo click.
                  </p>
                </div>
              </div>
            </div>

            {/* Buscar productos */}
            <div>
              <label className="label">Agregar productos</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input className="input pl-8" placeholder="Buscar por nombre o código..."
                  value={productoSearch} onChange={e => setProductoSearch(e.target.value)} />
                {productos.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 rounded-lg border shadow-lg overflow-hidden"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    {productos.map(p => (
                      <button key={p.productoId} type="button"
                        className="w-full text-left px-4 py-3 hover:bg-[var(--bg-tertiary)] transition-colors"
                        onClick={() => handleProductoClick(p)}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{p.descripcion}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded"
                              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                              Stock: {p.cantidad}
                            </span>
                            <span className="text-sm font-bold" style={{ color: 'var(--brand)' }}>{fmt(p.precio1)}</span>
                            {p.precio2 > 0 && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· {fmt(p.precio2)}</span>}
                            {p.precio3 > 0 && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· {fmt(p.precio3)}</span>}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tabla productos */}
            {fields.length > 0 ? (
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th className="w-24">Cant.</th>
                      <th className="w-32">Precio</th>
                      <th className="w-24">ITBIS</th>
                      <th className="text-right w-32">Subtotal</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((f, i) => {
                      const cant  = parseFloat(watch(`detalles.${i}.cantidad`) || 0)
                      const prec  = parseFloat(watch(`detalles.${i}.precio`)   || 0)
                      const itbis = Number(watch(`detalles.${i}.itbis`))
                      const sub   = cant * prec * (itbis === 1 ? (1 + itbsPct) : 1)
                      return (
                        <tr key={f.id}>
                          <td className="font-medium text-sm">{f.descripcion}</td>
                          <td>
                            <input type="number" step="0.01" min="0.01"
                              className="input text-center py-1 px-2 text-sm"
                              {...register(`detalles.${i}.cantidad`)} />
                          </td>
                          <td>
                            <input type="number" step="0.01"
                              className="input text-right py-1 px-2 text-sm"
                              {...register(`detalles.${i}.precio`)} />
                          </td>
                          <td>
                            <select className="input py-1 px-2 text-sm"
                              {...register(`detalles.${i}.itbis`, { valueAsNumber: true })}>
                              <option value={0}>Exento</option>
                              <option value={1}>18%</option>
                            </select>
                          </td>
                          <td className="text-right font-semibold text-sm tabular-nums">{fmt(sub)}</td>
                          <td>
                            <button type="button" onClick={() => remove(i)}
                              className="btn-ghost btn-icon btn-sm text-red-400 hover:text-red-600">×</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center py-10 rounded-xl border-2 border-dashed"
                style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Busca y agrega productos a la cotización
                </p>
              </div>
            )}

            {/* Totales */}
            {fields.length > 0 && (
              <div className="flex justify-end">
                <div className="w-72 space-y-2">
                  {[['Subtotal', fmt(subtotal)], ['ITBS (18%)', fmt(itbs)]].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                      <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t pt-2" style={{ borderColor: 'var(--border)' }}>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
                    <span className="text-2xl font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt(total)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={closeWithConfirm} className="btn-secondary flex-1">Cancelar</button>
              <button type="submit" disabled={busy || fields.length === 0} className="btn-primary flex-1">
                {busy ? 'Guardando...' : 'Guardar cotización'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {precioModal && (
        <PrecioSelectorModal
          producto={precioModal}
          onSelect={precio => agregarProducto(precioModal, precio)}
          onClose={() => setPrecioModal(null)}
        />
      )}

      {confirmCancel && (
        <div className="modal-overlay">
          <div className="modal-box max-w-sm">
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>¿Descartar cotización?</h3>
            <p className="text-sm mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>Se perderán todos los cambios.</p>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setConfirmCancel(false)}>No, continuar</button>
              <button className="btn-danger flex-1" onClick={onClose}>Sí, descartar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Página principal ─────────────────────────────────────────────
export function CotizacionesPage() {
  const [search, setSearch] = useState('')
  const [modal,  setModal]  = useState(null)
  const qc = useQueryClient()

  const { data: cotizaciones = [], isLoading } = useQuery({
    queryKey: ['cotizaciones'],
    queryFn:  () => api.get('/api/cotizaciones').then(r => r.data),
  })

  const create = useMutation({
    mutationFn: (d) => api.post('/api/cotizaciones', d),
    onSuccess:  () => { qc.invalidateQueries(['cotizaciones']); toast.success('Cotización creada'); setModal(null) },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const convertir = useMutation({
    mutationFn: (d) => api.post(`/api/cotizaciones/${d.cotizacionId}/convertir`, d),
    onSuccess:  (res) => {
      qc.invalidateQueries(['cotizaciones'])
      qc.invalidateQueries(['facturas'])
      toast.success(`¡Factura #${res.data?.facturaId} creada exitosamente! 🎉`)
      setModal(null)
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al convertir'),
  })

  const list = cotizaciones.filter(c => {
    const q = search.toLowerCase()
    return !q || (c.nombreCliente || '').toLowerCase().includes(q) || String(c.cotizacionId).includes(q)
  })

  const totalCotizado = cotizaciones.reduce((s, c) => s + c.total, 0)

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cotizaciones</h1>
          <p className="page-sub">{cotizaciones.length} cotizaciones</p>
        </div>
        <button onClick={() => setModal('nueva')} className="btn-primary">
          <Plus size={15} /> Nueva cotización
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20">
            <ClipboardList size={18} className="text-blue-500" />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total cotizaciones</p>
            <p className="text-lg font-extrabold text-blue-500">{cotizaciones.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-900/20">
            <ArrowRightCircle size={18} className="text-green-500" />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Valor total cotizado</p>
            <p className="text-lg font-extrabold text-green-500">{fmt(totalCotizado)}</p>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input className="input pl-8" placeholder="Buscar cliente o # cotización..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Tabla */}
      <div className="tbl-wrap">
        <table className="tbl table-fixed w-full">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th className="w-48">Cliente</th>
              <th className="w-28">Fecha</th>
              <th className="w-32 text-right">ITBIS</th>
              <th className="w-32 text-right">Total</th>
              <th className="w-24"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Cargando...</td></tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <ClipboardList size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-muted)' }}>No hay cotizaciones</p>
                </td>
              </tr>
            ) : list.map(c => (
              <tr key={c.cotizacionId}>
                <td className="font-bold text-sm" style={{ color: 'var(--brand)' }}>#{c.cotizacionId}</td>
                <td className="font-medium text-sm truncate">{c.nombreCliente || 'Sin cliente'}</td>
                <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(c.fecha).toLocaleDateString('es-DO')}
                </td>
                <td className="text-right text-sm tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                  {fmt(c.itbis)}
                </td>
                <td className="text-right font-semibold text-sm tabular-nums">{fmt(c.total)}</td>
                <td>
                  <div className="flex gap-1 justify-end">
                    <button
                      onClick={() => setModal({ ver: c.cotizacionId })}
                      className="btn-ghost btn-icon btn-sm" title="Ver / Convertir">
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => setModal({ ver: c.cotizacionId })}
                      className="btn-ghost btn-icon btn-sm text-green-500" title="Convertir a factura">
                      <ArrowRightCircle size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      {modal === 'nueva' && (
        <NuevaCotizacionModal
          onClose={() => setModal(null)}
          onSave={create.mutate}
          busy={create.isPending}
        />
      )}
      {modal?.ver && (
        <CotizacionDetalle
          cotizacionId={modal.ver}
          onClose={() => setModal(null)}
          onConvertir={convertir.mutate}
          converting={convertir.isPending}
        />
      )}
    </div>
  )
}
