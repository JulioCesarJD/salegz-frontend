import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Eye, XCircle, DollarSign, ShoppingCart } from 'lucide-react'
import { useForm, useFieldArray } from 'react-hook-form'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

const fmt = (v) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v || 0)

const ESTADO = {
  0: <span className="badge badge-gray">Contado</span>,
  1: <span className="badge badge-yellow">Crédito</span>,
  2: <span className="badge badge-green">Saldado</span>,
  3: <span className="badge badge-red">Cancelado</span>,
}

// ── Ver detalle compra ───────────────────────────────────────────
function CompraDetalle({ compraId, onClose }) {
  const { data: c, isLoading } = useQuery({
    queryKey: ['compra', compraId],
    queryFn:  () => api.get(`/api/compras/${compraId}`).then(r => r.data),
  })

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
              Compra #{c?.compraId}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {new Date(c?.fecha).toLocaleDateString('es-DO', { dateStyle: 'full' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {ESTADO[c?.estado]}
            <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            ['Proveedor', c?.nombreCliente || 'Sin proveedor'],
            ['Usuario',   c?.usuario],
            ['Tipo pago', c?.tipoPago],
            ['Total',     fmt(c?.total)],
          ].map(([l, v]) => (
            <div key={l} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{l}</p>
              <p className="font-semibold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{v || '—'}</p>
            </div>
          ))}
        </div>

        <div className="tbl-wrap mb-4">
          <table className="tbl table-fixed w-full">
            <thead>
              <tr>
                <th>Producto</th>
                <th className="w-20 text-right">Cant.</th>
                <th className="w-32 text-right">Precio unit.</th>
                <th className="w-32 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {c?.detalles?.map((d, i) => (
                <tr key={i}>
                  <td className="font-medium">{d.producto}</td>
                  <td className="text-start tabular-nums">{d.cantidad}</td>
                  <td className="text-start tabular-nums text-sm"
                    style={{ color: 'var(--text-secondary)' }}>
                    {fmt(d.subTotal / d.cantidad)}
                  </td>
                  <td className="text-start font-semibold tabular-nums">{fmt(d.subTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between border-t pt-4" style={{ borderColor: 'var(--border)' }}>
          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
          <span className="text-xl font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {fmt(c?.total)}
          </span>
        </div>

        <button onClick={onClose} className="btn-secondary w-full mt-5">Cerrar</button>
      </div>
    </div>
  )
}

// ── Modal saldar compra ──────────────────────────────────────────
function SaldarModal({ compra, onClose, onSave, busy }) {
  const { register, handleSubmit } = useForm()
  const { user } = useAuthStore()

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-sm">
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Registrar pago</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
          Compra #{compra.compraId} · <strong className="text-red-500">{fmt(compra.total)}</strong>
        </p>
        <form onSubmit={handleSubmit(d => onSave({
          compraId:  compra.compraId,
          usuarioId: user?.usuarioId,
          monto:     parseFloat(d.monto),
        }))} className="space-y-4">
          <div>
            <label className="label">Monto a abonar *</label>
            <input type="number" step="0.01" className="input text-right text-lg font-bold"
              placeholder="0.00"
              {...register('monto', { required: true, min: 0.01 })} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">
              {busy ? 'Guardando...' : 'Registrar pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Modal nueva compra ───────────────────────────────────────────
function NuevaCompraModal({ onClose, onSave, busy }) {
  const { user } = useAuthStore()
  const [proveedorSearch, setProveedorSearch] = useState('')
  const [productoSearch,  setProductoSearch]  = useState('')
  const [proveedorSel,    setProveedorSel]    = useState(null)
  const [confirmCancel,   setConfirmCancel]   = useState(false)

  const { register, handleSubmit, watch, control, formState: { isDirty } } = useForm({
    defaultValues: { tipoPago: 'Efectivo', estado: 0, detalles: [] },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'detalles' })

  const { data: proveedores = [] } = useQuery({
    queryKey: ['clientes-search', proveedorSearch],
    queryFn:  () => proveedorSearch.length >= 2 ? api.get(`/api/clientes/search?q=${proveedorSearch}`).then(r => r.data) : [],
    enabled: proveedorSearch.length >= 2,
  })

  const { data: productos = [] } = useQuery({
    queryKey: ['productos-search', productoSearch],
    queryFn:  () => productoSearch.length >= 1 ? api.get(`/api/productos/search?q=${productoSearch}`).then(r => r.data) : [],
    enabled: productoSearch.length >= 1,
  })

  const detalles = watch('detalles')
  const total = detalles.reduce((s, d) => s + parseFloat(d.cantidad||0) * parseFloat(d.costo||0), 0)

  const agregarProducto = (p) => {
    append({
      productoId:  p.productoId,
      descripcion: p.descripcion,
      cantidad:    1,
      costo:       p.costo || 0,
    })
    setProductoSearch('')
  }

  const closeWithConfirm = () => {
    if (isDirty || detalles?.length > 0 || proveedorSel || proveedorSearch || productoSearch) setConfirmCancel(true)
    else onClose()
  }

  const submit = (data) => {
    if (fields.length === 0) { toast.error('Agrega al menos un producto'); return }
    onSave({
      clienteId: proveedorSel?.clienteId || null,
      usuarioId: user?.usuarioId,
      total,
      tipoPago:  data.tipoPago,
      estado:    parseInt(data.estado),
      detalles:  data.detalles.map(d => ({
        productoId: d.productoId,
        cantidad:   parseFloat(d.cantidad),
        subTotal:   parseFloat(d.cantidad) * parseFloat(d.costo),
      })),
    })
  }

  return (
    <>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeWithConfirm()}>
        <div className="modal-box max-w-4xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Nueva compra</h2>
            <button onClick={closeWithConfirm} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
          </div>

          <form onSubmit={handleSubmit(submit)} className="space-y-5">

            {/* Fila 1 */}
            <div className="grid grid-cols-3 gap-4">
              {/* Proveedor */}
              <div className="relative">
                <label className="label">Proveedor (opcional)</label>
                {proveedorSel ? (
                  <div className="input flex items-center justify-between">
                    <span className="text-sm font-medium">{proveedorSel.nombre}</span>
                    <button type="button" onClick={() => setProveedorSel(null)} className="text-red-400 hover:text-red-600">×</button>
                  </div>
                ) : (
                  <>
                    <input className="input" placeholder="Buscar proveedor..."
                      value={proveedorSearch} onChange={e => setProveedorSearch(e.target.value)} />
                    {proveedores.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 rounded-lg border shadow-lg overflow-hidden"
                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        {proveedores.map(p => (
                          <button key={p.clienteId} type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-tertiary)]"
                            onClick={() => { setProveedorSel(p); setProveedorSearch('') }}>
                            {p.nombre}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Tipo pago */}
              <div>
                <label className="label">Tipo de pago</label>
                <select className="input" {...register('tipoPago')}>
                  {['Efectivo','Tarjeta','Transferencia','Cheque','Crédito'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="label">Estado</label>
                <select className="input" {...register('estado')}>
                  <option value={0}>Contado</option>
                  <option value={1}>Crédito</option>
                </select>
              </div>
            </div>

            {/* Buscar productos */}
            <div>
              <label className="label">Agregar productos</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }} />
                <input className="input pl-8" placeholder="Buscar por nombre o código..."
                  value={productoSearch} onChange={e => setProductoSearch(e.target.value)} />
                {productos.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 rounded-lg border shadow-lg overflow-hidden"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    {productos.map(p => (
                      <button key={p.productoId} type="button"
                        className="w-full text-left px-4 py-3 hover:bg-[var(--bg-tertiary)] transition-colors"
                        onClick={() => agregarProducto(p)}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{p.descripcion}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded"
                              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                              Stock: {p.cantidad}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              Costo: <strong>{fmt(p.costo)}</strong>
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tabla */}
            {fields.length > 0 ? (
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th className="w-28">Cantidad</th>
                      <th className="w-36">Costo unit.</th>
                      <th className="text-right w-36">Subtotal</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((f, i) => {
                      const cant  = parseFloat(watch(`detalles.${i}.cantidad`) || 0)
                      const costo = parseFloat(watch(`detalles.${i}.costo`)    || 0)
                      return (
                        <tr key={f.id}>
                          <td className="font-medium text-sm">{f.descripcion}</td>
                          <td>
                            <input type="number" step="0.01" min="0.01"
                              className="input text-center py-1.5 px-2 text-sm w-24"
                              {...register(`detalles.${i}.cantidad`)} />
                          </td>
                          <td>
                            <input type="number" step="0.01"
                              className="input text-right py-1.5 px-2 text-sm w-32"
                              {...register(`detalles.${i}.costo`)} />
                          </td>
                          <td className="text-right font-semibold text-sm tabular-nums">
                            {fmt(cant * costo)}
                          </td>
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
                  Busca y agrega productos a la compra
                </p>
              </div>
            )}

            {/* Total */}
            {fields.length > 0 && (
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                    <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Total</span>
                    <span className="text-2xl font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                      {fmt(total)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={closeWithConfirm} className="btn-secondary flex-1">Cancelar</button>
              <button type="submit" disabled={busy || fields.length === 0} className="btn-primary flex-1">
                {busy ? 'Guardando...' : 'Registrar compra'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {confirmCancel && (
        <div className="modal-overlay">
          <div className="modal-box max-w-sm">
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>¿Descartar compra?</h3>
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
export function ComprasPage() {
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState('')
  const [modal,  setModal]  = useState(null)
  const qc = useQueryClient()

  const { data: compras = [], isLoading } = useQuery({
    queryKey: ['compras', estado],
    queryFn:  () => api.get(`/api/compras${estado !== '' ? `?estado=${estado}` : ''}`).then(r => r.data),
  })

  const create = useMutation({
    mutationFn: (d) => api.post('/api/compras', d),
    onSuccess:  () => { qc.invalidateQueries(['compras']); toast.success('Compra registrada'); setModal(null) },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const saldar = useMutation({
    mutationFn: (d) => api.patch(`/api/compras/${d.compraId}/saldar`, d),
    onSuccess:  () => { qc.invalidateQueries(['compras']); toast.success('Pago registrado'); setModal(null) },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const cancelar = useMutation({
    mutationFn: (id) => api.patch(`/api/compras/${id}/cancelar`),
    onSuccess:  () => { qc.invalidateQueries(['compras']); toast.success('Compra cancelada') },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const list         = compras.filter(c => { const q = search.toLowerCase(); return !q || (c.nombreCliente||'').toLowerCase().includes(q) || String(c.compraId).includes(q) })
  const totalCompras = compras.reduce((s, c) => c.estado !== 3 ? s + c.total : s, 0)
  const porPagar     = compras.filter(c => c.estado === 1).length

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Compras</h1>
          <p className="page-sub">{compras.length} compras registradas</p>
        </div>
        <button onClick={() => setModal('nueva')} className="btn-primary">
          <Plus size={15} /> Nueva compra
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Total',      compras.length,                          'var(--text-primary)'],
          ['Contado',    compras.filter(c=>c.estado===0).length,  'var(--text-secondary)'],
          ['Crédito',    compras.filter(c=>c.estado===1).length,  '#f59e0b'],
          ['Canceladas', compras.filter(c=>c.estado===3).length,  'var(--text-muted)'],
        ].map(([l, v, color]) => (
          <div key={l} className="card text-center py-3">
            <p className="text-xl font-extrabold" style={{ color }}>{v}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{l}</p>
          </div>
        ))}
      </div>

      {/* Resumen $ */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20">
            <ShoppingCart size={18} className="text-blue-500" />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total en compras</p>
            <p className="text-lg font-extrabold text-blue-500">{fmt(totalCompras)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
            <DollarSign size={18} className="text-yellow-500" />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Cuentas por pagar</p>
            <p className="text-lg font-extrabold text-yellow-500">{porPagar} pendientes</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input pl-8 w-60" placeholder="Buscar proveedor o # compra..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-40" value={estado} onChange={e => setEstado(e.target.value)}>
          <option value="">Todos</option>
          <option value="0">Contado</option>
          <option value="1">Crédito</option>
          <option value="2">Saldado</option>
          <option value="3">Cancelado</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="tbl-wrap">
        <table className="tbl table-fixed w-full">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th className="w-44">Proveedor</th>
              <th className="w-24">Fecha</th>
              <th className="w-28">Tipo pago</th>
              <th className="w-32 text-right">Total</th>
              <th className="w-24">Estado</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Cargando...</td></tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <ShoppingCart size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-muted)' }}>No hay compras</p>
                </td>
              </tr>
            ) : list.map(c => (
              <tr key={c.compraId}>
                <td className="font-bold text-sm" style={{ color: 'var(--brand)' }}>#{c.compraId}</td>
                <td className="font-medium text-sm truncate">{c.nombreCliente || 'Sin proveedor'}</td>
                <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(c.fecha).toLocaleDateString('es-DO')}
                </td>
                <td><span className="badge badge-gray">{c.tipoPago}</span></td>
                <td className="text-start font-semibold text-sm tabular-nums">{fmt(c.total)}</td>
                <td>{ESTADO[c.estado]}</td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => setModal({ ver: c.compraId })}
                      className="btn-ghost btn-icon btn-sm" title="Ver">
                      <Eye size={14} />
                    </button>
                    {c.estado === 1 && (
                      <button onClick={() => setModal({ saldar: true, compra: c })}
                        className="btn-ghost btn-icon btn-sm text-green-500" title="Registrar pago">
                        <DollarSign size={14} />
                      </button>
                    )}
                    {c.estado !== 3 && (
                      <button onClick={() => { if (confirm('¿Cancelar esta compra?')) cancelar.mutate(c.compraId) }}
                        className="btn-ghost btn-icon btn-sm text-red-400" title="Cancelar">
                        <XCircle size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === 'nueva' && <NuevaCompraModal onClose={() => setModal(null)} onSave={create.mutate} busy={create.isPending} />}
      {modal?.ver    && <CompraDetalle compraId={modal.ver} onClose={() => setModal(null)} />}
      {modal?.saldar && <SaldarModal compra={modal.compra} onClose={() => setModal(null)} onSave={saldar.mutate} busy={saldar.isPending} />}
    </div>
  )
}
