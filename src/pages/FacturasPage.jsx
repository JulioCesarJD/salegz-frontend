import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Eye, XCircle, DollarSign, FileText, Banknote, CreditCard, ArrowRight, Printer } from 'lucide-react'
import { useForm, useFieldArray } from 'react-hook-form'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { printFactura } from '../utils/printFactura'

const fmt = (v) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v || 0)

const ESTADO = {
  0: <span className="badge badge-red">Cancelada</span>,
  1: <span className="badge badge-blue">Activa</span>,
  2: <span className="badge badge-green">Saldada</span>,
  3: <span className="badge badge-yellow">Cuenta abierta</span>,
}

const TIPO_COMPROBANTE = [
  { value: 0, label: 'Fiscal (B01)' },
  { value: 1, label: 'Consumidor Final (B02)' },
  { value: 2, label: 'Régimen Especial (B14)' },
  { value: 3, label: 'Gubernamental (B15)' },
]

// ── Modal Cobro (post-creación) ──────────────────────────────────
function CobroModal({ factura, onClose, onCobrar, busy }) {
  const [monto, setMonto] = useState(factura.total)
  const [tipoPago, setTipoPago] = useState(factura.tipoPago || 'Efectivo')
  const { user } = useAuthStore()

  const cambio    = monto - factura.total
  const pendiente = factura.total - monto
  const esPagado  = monto >= factura.total

  const handleCobrar = () => {
    onCobrar({
      facturaId: factura.facturaId,
      usuarioId: user?.usuarioId,
      monto:     Math.min(parseFloat(monto), factura.total),
    })
  }

  const handleDejarPendiente = () => onClose()

  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-md">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
            <Banknote size={26} className="text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            Cobrar factura #{factura.facturaId}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Cliente: <strong>{factura.nombreCliente}</strong>
          </p>
        </div>

        {/* Total a cobrar */}
        <div className="rounded-xl p-4 mb-5 text-center"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
            Total de la factura
          </p>
          <p className="text-4xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            {fmt(factura.total)}
          </p>
        </div>

        {/* Tipo de pago */}
        <div className="mb-4">
          <label className="label">Tipo de pago</label>
          <div className="grid grid-cols-3 gap-2">
            {['Efectivo', 'Tarjeta', 'Transferencia'].map(t => (
              <button key={t} type="button"
                onClick={() => setTipoPago(t)}
                className={`py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                  tipoPago === t
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'hover:bg-[var(--bg-tertiary)]'
                }`}
                style={{
                  backgroundColor: tipoPago === t ? 'var(--brand-light)' : 'var(--bg-card)',
                  borderColor: tipoPago === t ? 'var(--brand)' : 'var(--border)',
                  color: tipoPago === t ? 'var(--brand)' : 'var(--text-secondary)',
                }}>
                {t === 'Efectivo' && <Banknote size={14} className="mx-auto mb-1" />}
                {t === 'Tarjeta'  && <CreditCard size={14} className="mx-auto mb-1" />}
                {t === 'Transferencia' && <ArrowRight size={14} className="mx-auto mb-1" />}
                {t}
              </button>
            ))}
          </div>
          {/* Otros tipos */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['Cheque', 'Crédito'].map(t => (
              <button key={t} type="button"
                onClick={() => setTipoPago(t)}
                className={`py-2 rounded-lg text-sm font-semibold border transition-all`}
                style={{
                  backgroundColor: tipoPago === t ? 'var(--brand-light)' : 'var(--bg-card)',
                  borderColor: tipoPago === t ? 'var(--brand)' : 'var(--border)',
                  color: tipoPago === t ? 'var(--brand)' : 'var(--text-secondary)',
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Monto recibido */}
        <div className="mb-4">
          <label className="label">
            {tipoPago === 'Crédito' ? 'Monto de abono (0 = todo en crédito)' : 'Monto recibido'}
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="input text-right text-2xl font-extrabold py-3"
            value={monto}
            onChange={e => setMonto(parseFloat(e.target.value) || 0)}
            style={{ color: 'var(--text-primary)' }}
          />
          {/* Atajos rápidos */}
          <div className="flex gap-2 mt-2">
            {[factura.total, Math.ceil(factura.total / 100) * 100, Math.ceil(factura.total / 500) * 500, Math.ceil(factura.total / 1000) * 1000]
              .filter((v, i, arr) => arr.indexOf(v) === i)
              .slice(0, 4)
              .map(v => (
                <button key={v} type="button"
                  onClick={() => setMonto(v)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:bg-[var(--bg-tertiary)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  {fmt(v)}
                </button>
              ))
            }
          </div>
        </div>

        {/* Cambio / Pendiente */}
        {monto > 0 && (
          <div className={`rounded-xl p-4 mb-5 flex justify-between items-center ${
            esPagado ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'
          }`}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: esPagado ? '#16a34a' : '#d97706' }}>
                {esPagado ? (cambio > 0 ? 'Cambio a devolver' : 'Pago exacto ✓') : 'Queda pendiente'}
              </p>
              {esPagado && cambio > 0 && (
                <p className="text-2xl font-extrabold text-green-600">{fmt(cambio)}</p>
              )}
              {!esPagado && (
                <p className="text-2xl font-extrabold text-yellow-600">{fmt(pendiente)}</p>
              )}
            </div>
            {esPagado && cambio === 0 && (
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-lg">✓</span>
              </div>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="space-y-2">
          <button
            onClick={handleCobrar}
            disabled={busy || (tipoPago !== 'Crédito' && monto <= 0)}
            className="btn-primary w-full py-3 text-base"
          >
            {busy ? 'Procesando...' : tipoPago === 'Crédito' && monto === 0 ? 'Dejar en crédito' : `Cobrar ${fmt(Math.min(monto, factura.total))}`}
          </button>
          <button onClick={handleDejarPendiente} className="btn-ghost w-full py-2 text-sm">
            Dejar pendiente y cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Ver detalle factura ──────────────────────────────────────────
function FacturaDetalle({ facturaId, onClose }) {
  const { data: f, isLoading } = useQuery({
    queryKey: ['factura', facturaId],
    queryFn:  () => api.get(`/api/facturas/${facturaId}`).then(r => r.data),
  })
  const { data: empresa }  = useQuery({ queryKey: ['empresa'],   queryFn: () => api.get('/api/empresa').then(r => r.data) })
  const { data: control }  = useQuery({ queryKey: ['controles'], queryFn: () => api.get('/api/empresa/control').then(r => r.data) })

  const handlePrint = () => printFactura(f, empresa, control)

  if (isLoading) return <div className="modal-overlay"><div className="modal-box max-w-2xl flex items-center justify-center py-12"><p style={{ color: 'var(--text-muted)' }}>Cargando...</p></div></div>
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2
              className="text-lg font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Factura #{f?.facturaId}
            </h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {new Date(f?.fecha).toLocaleDateString("es-DO", {
                dateStyle: "full",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {ESTADO[f?.estado]}
            <button
              onClick={onClose}
              className="btn-ghost btn-icon text-lg leading-none rounded-lg"
            >
              ×
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            ["Cliente", f?.nombreCliente],
            ["Usuario", f?.usuario],
            ["Tipo pago", f?.tipoPago],
            ["Orden #", f?.numOrden],
          ].map(([l, v]) => (
            <div
              key={l}
              className="p-3 rounded-lg"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            >
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {l}
              </p>
              <p
                className="font-semibold text-sm mt-0.5"
                style={{ color: "var(--text-primary)" }}
              >
                {v || "—"}
              </p>
            </div>
          ))}
        </div>
        <div className="tbl-wrap mb-4">
          <table className="tbl">
            <thead>
              <tr>
                <th>Producto</th>
                <th className="text-right">Cant.</th>
                <th className="text-right">ITBS</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {f?.detalles?.map((d, i) => (
                <tr key={i}>
                  <td className="font-medium">{d.producto}</td>
                  <td className="text-start">{d.cantidad}</td>
                  <td className="text-start">{fmt(d.itbs)}</td>
                  <td className="text-center font-semibold">
                    {fmt(d.subTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          className="space-y-2 border-t pt-4"
          style={{ borderColor: "var(--border)" }}
        >
          {[
            ["Exento", fmt(f?.exento), false],
            ["Gravado", fmt(f?.gravado), false],
            ["ITBS", fmt(f?.itbs), false],
            ["Total", fmt(f?.total), true],
            ["Pagado", fmt(f?.pagado), false],
            ["Pendiente", fmt((f?.total || 0) - (f?.pagado || 0)), false],
          ].map(([l, v, bold]) => (
            <div key={l} className="flex justify-between">
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                {l}
              </span>
              <span
                className={`text-sm ${bold ? "text-lg font-extrabold" : "font-medium"}`}
                style={{
                  color: bold ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cerrar
          </button>
          <button onClick={handlePrint} className="btn-primary flex-1">
            <Printer size={15} /> Imprimir
          </button>
        </div>
      </div>
    </div>
  );
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

// ── Modal nueva factura ──────────────────────────────────────────
function NuevaFacturaModal({ onClose, onSave, busy }) {
  const { user } = useAuthStore()
  const [clienteSearch,  setClienteSearch]  = useState('')
  const [productoSearch, setProductoSearch] = useState('')
  const [clienteSel,     setClienteSel]     = useState(null)
  const [precioModal,    setPrecioModal]    = useState(null)
  const [confirmCancel,  setConfirmCancel]  = useState(false)
  const itbsPct = 0.18

  const { register, handleSubmit, watch, control, formState: { isDirty } } = useForm({
    defaultValues: { tipoPago: 'Efectivo', tipoComprobante: 1, detalles: [] },
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
  const exento  = detalles.reduce((s,d) => s + (Number(d.itbis)===0 ? parseFloat(d.cantidad||0)*parseFloat(d.precio||0) : 0), 0)
  const gravado = detalles.reduce((s,d) => s + (Number(d.itbis)===1 ? parseFloat(d.cantidad||0)*parseFloat(d.precio||0) : 0), 0)
  const itbs    = gravado * itbsPct
  const total   = exento + gravado + itbs

  const handleProductoClick = (p) => {
    const precios = [p.precio1, p.precio2, p.precio3].filter(v => v > 0)
    if (precios.length > 1) { setPrecioModal(p); setProductoSearch('') }
    else agregarProducto(p, p.precio1)
  }

  const agregarProducto = (p, precio) => {
    append({ productoId: p.productoId, descripcion: p.descripcion, cantidad: 1, precio, itbis: 0, costo: 0, comision: 0 })
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
      empresaId:       1,
      clienteId:       clienteSel?.clienteId || null,
      usuarioId:       user?.usuarioId,
      nombreCliente:   clienteSel?.nombre || data.nombreCliente || 'Consumidor Final',
      tipoPago:        data.tipoPago,
      total, itbs,
      pagado:          0,   // siempre 0 — el cobro se hace en CobroModal
      exento, gravado,
      tarjeta:         data.tipoPago === 'Tarjeta',
      tipoComprobante: parseInt(data.tipoComprobante),
      detalles: data.detalles.map(d => ({
        productoId: d.productoId,
        cantidad:   parseFloat(d.cantidad),
        subTotal:   parseFloat(d.cantidad) * parseFloat(d.precio),
        itbs:       Number(d.itbis)===1 ? parseFloat(d.cantidad)*parseFloat(d.precio)*itbsPct : 0,
        costo:      parseFloat(d.costo||0),
        comision:   parseFloat(d.comision||0),
      })),
    })
  }

  return (
    <>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeWithConfirm()}>
        <div className="modal-box max-w-5xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Nueva factura</h2>
            <button onClick={closeWithConfirm} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
          </div>

          <form onSubmit={handleSubmit(submit)} className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <div className="relative">
                <label className="label">Cliente</label>
                {clienteSel ? (
                  <div className="input flex items-center justify-between">
                    <span className="text-sm font-medium">{clienteSel.nombre}</span>
                    <button type="button" onClick={() => setClienteSel(null)} className="text-red-400 hover:text-red-600">×</button>
                  </div>
                ) : (
                  <>
                    <input className="input" placeholder="Buscar cliente..." value={clienteSearch} onChange={e => setClienteSearch(e.target.value)} />
                    {clientes.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 rounded-lg border shadow-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        {clientes.map(c => <button key={c.clienteId} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-tertiary)]" onClick={() => { setClienteSel(c); setClienteSearch('') }}>{c.nombre}</button>)}
                      </div>
                    )}
                  </>
                )}
                {!clienteSel && <div className="mt-2"><label className="label">O escribe nombre</label><input className="input" placeholder="Consumidor Final" {...register('nombreCliente')} /></div>}
              </div>
              <div>
                <label className="label">Comprobante</label>
                <select className="input" {...register('tipoComprobante')}>
                  {TIPO_COMPROBANTE.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Tipo de pago</label>
                <select className="input" {...register('tipoPago')}>
                  {['Efectivo','Tarjeta','Transferencia','Cheque','Crédito'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Agregar productos</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input className="input pl-8" placeholder="Buscar por nombre o código..." value={productoSearch} onChange={e => setProductoSearch(e.target.value)} />
                {productos.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 rounded-lg border shadow-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    {productos.map(p => (
                      <button key={p.productoId} type="button" className="w-full text-left px-4 py-3 hover:bg-[var(--bg-tertiary)] transition-colors" onClick={() => handleProductoClick(p)}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{p.descripcion}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>Stock: {p.cantidad}</span>
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

            {fields.length > 0 ? (
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead><tr><th>Producto</th><th className="w-24">Cant.</th><th className="w-32">Precio</th><th className="w-24">ITBIS</th><th className="text-right w-32">Subtotal</th><th className="w-10"></th></tr></thead>
                  <tbody>
                    {fields.map((f,i) => {
                      const cant  = parseFloat(watch(`detalles.${i}.cantidad`)||0)
                      const prec  = parseFloat(watch(`detalles.${i}.precio`)||0)
                      const itbis = Number(watch(`detalles.${i}.itbis`))
                      const sub   = cant * prec * (itbis===1 ? (1+itbsPct) : 1)
                      return (
                        <tr key={f.id}>
                          <td className="font-medium text-sm">{f.descripcion}</td>
                          <td><input type="number" step="0.01" min="0.01" className="input text-center py-1 px-2 text-sm" {...register(`detalles.${i}.cantidad`)} /></td>
                          <td><input type="number" step="0.01" className="input text-right py-1 px-2 text-sm" {...register(`detalles.${i}.precio`)} /></td>
                          <td>
                            <select className="input py-1 px-2 text-sm" {...register(`detalles.${i}.itbis`, { valueAsNumber: true })}>
                              <option value={0}>Exento</option>
                              <option value={1}>18%</option>
                            </select>
                          </td>
                          <td className="text-right font-semibold text-sm">{fmt(sub)}</td>
                          <td><button type="button" onClick={() => remove(i)} className="btn-ghost btn-icon btn-sm text-red-400 hover:text-red-600">×</button></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center py-10 rounded-xl border-2 border-dashed" style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Busca y agrega productos a la factura</p>
              </div>
            )}

            {fields.length > 0 && (
              <div className="flex justify-end">
                <div className="w-72 space-y-2">
                  {[['Exento',fmt(exento)],['Gravado',fmt(gravado)],['ITBS (18%)',fmt(itbs)]].map(([l,v]) => (
                    <div key={l} className="flex justify-between text-sm"><span style={{ color:'var(--text-muted)' }}>{l}</span><span style={{ color:'var(--text-secondary)' }}>{v}</span></div>
                  ))}
                  <div className="flex justify-between border-t pt-2" style={{ borderColor:'var(--border)' }}>
                    <span className="font-bold" style={{ color:'var(--text-primary)' }}>Total</span>
                    <span className="text-2xl font-extrabold" style={{ color:'var(--text-primary)' }}>{fmt(total)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={closeWithConfirm} className="btn-secondary flex-1">Cancelar</button>
              <button type="submit" disabled={busy || fields.length===0} className="btn-primary flex-1">
                {busy ? 'Guardando...' : 'Crear factura y cobrar →'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {precioModal && <PrecioSelectorModal producto={precioModal} onSelect={precio => agregarProducto(precioModal, precio)} onClose={() => setPrecioModal(null)} />}
      {confirmCancel && (
        <div className="modal-overlay">
          <div className="modal-box max-w-sm">
            <h3 className="text-base font-bold" style={{ color:'var(--text-primary)' }}>¿Descartar factura?</h3>
            <p className="text-sm mt-1 mb-4" style={{ color:'var(--text-muted)' }}>Se perderán todos los cambios.</p>
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
export function FacturasPage() {
  const { user }   = useAuthStore()
  const isAdmin    = user?.tipoUsuario === 0
   const localDate = (d = new Date()) =>
    `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  const hoy = localDate()

  const [search,       setSearch]       = useState('')
  const [estado,       setEstado]       = useState('')
  const [desde,        setDesde]        = useState(hoy)
  const [hasta,        setHasta]        = useState(hoy)
  const [soloMios,     setSoloMios]     = useState(!isAdmin)
  const [modal,        setModal]        = useState(null)
  const [cobroFactura, setCobroFactura] = useState(null)
  const qc = useQueryClient()

  const { data: facturas = [], isLoading } = useQuery({
    queryKey: ['facturas', estado, desde, hasta, soloMios],
    queryFn:  () => {
      const params = new URLSearchParams()
      if (estado)   params.append('estado', estado)
      if (desde)    params.append('desde', desde)
      if (hasta)    params.append('hasta', hasta)
      if (soloMios) params.append('usuarioId', user?.usuarioId)
      const qs = params.toString()
      return api.get(`/api/facturas${qs ? `?${qs}` : ''}`).then(r => r.data)
    },
  })

  const create = useMutation({
    mutationFn: (d) => api.post('/api/facturas', d),
    onSuccess: (res) => {
      qc.invalidateQueries(['facturas'])
      toast.success('Factura creada')
      setModal(null)
      // Abrir modal de cobro con la factura creada
      // El backend retorna { id } — buscamos los datos completos
      const facturaId = res.data?.id
      if (facturaId) {
        // Obtener datos de la factura recién creada
        api.get(`/api/facturas/${facturaId}`).then(r => setCobroFactura(r.data))
      }
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear factura'),
  })

  const saldar = useMutation({
    mutationFn: (d) => api.patch(`/api/facturas/${d.facturaId}/saldar`, d),
    onSuccess: () => {
      qc.invalidateQueries(['facturas'])
      toast.success('¡Cobro registrado! 💰')
      setCobroFactura(null)
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const cancelar = useMutation({
    mutationFn: (id) => api.patch(`/api/facturas/${id}/cancelar`),
    onSuccess: () => { qc.invalidateQueries(['facturas']); toast.success('Factura cancelada') },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  // Saldar desde la lista (cuentas abiertas)
  const saldarLista = useMutation({
    mutationFn: (d) => api.patch(`/api/facturas/${d.facturaId}/saldar`, d),
    onSuccess: () => { qc.invalidateQueries(['facturas']); toast.success('Pago registrado'); setModal(null) },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const list      = facturas.filter(f => { const q = search.toLowerCase(); return !q || f.nombreCliente.toLowerCase().includes(q) || String(f.facturaId).includes(q) })
  const totalMes  = facturas.reduce((s,f) => f.estado!==0 ? s+f.total  : s, 0)
  const pendiente = facturas.reduce((s,f) => f.estado!==0 ? s+(f.total-f.pagado) : s, 0)

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div><h1 className="page-title">Facturas</h1><p className="page-sub">{facturas.length} facturas</p></div>
        <button onClick={() => setModal('nueva')} className="btn-primary"><Plus size={15}/> Nueva factura</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[['Total',facturas.length,'var(--text-primary)'],['Saldadas',facturas.filter(f=>f.estado===2).length,'#22c55e'],['Cuentas abiertas',facturas.filter(f=>f.estado===3).length,'#f59e0b'],['Canceladas',facturas.filter(f=>f.estado===0).length,'var(--text-muted)']].map(([l,v,color]) => (
          <div key={l} className="card text-center py-3"><p className="text-xl font-extrabold" style={{ color }}>{v}</p><p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>{l}</p></div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card flex items-center gap-3"><div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-900/20"><DollarSign size={18} className="text-green-500"/></div><div><p className="text-xs" style={{ color:'var(--text-muted)' }}>Total facturado</p><p className="text-lg font-extrabold text-green-500">{fmt(totalMes)}</p></div></div>
        <div className="card flex items-center gap-3"><div className="p-2.5 rounded-xl bg-yellow-50 dark:bg-yellow-900/20"><FileText size={18} className="text-yellow-500"/></div><div><p className="text-xs" style={{ color:'var(--text-muted)' }}>Por cobrar</p><p className="text-lg font-extrabold text-yellow-500">{fmt(pendiente)}</p></div></div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-muted)' }}/>
          <input className="input pl-8 w-52" placeholder="Buscar cliente o # factura..."
            value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <select className="input w-40" value={estado} onChange={e => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="0">Cancelada</option>
          <option value="1">Activa</option>
          <option value="2">Saldada</option>
          <option value="3">Cuenta abierta</option>
        </select>
        <div>
          <label className="label">Desde</label>
          <input type="date" className="input w-36" value={desde} onChange={e => setDesde(e.target.value)} />
        </div>
        <div>
          <label className="label">Hasta</label>
          <input type="date" className="input w-36" value={hasta} onChange={e => setHasta(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setDesde(hoy); setHasta(hoy) }} className="btn-secondary btn-sm">Hoy</button>
          <button onClick={() => {
            const d = new Date()
            setDesde(localDate(new Date(d.getFullYear(), d.getMonth(), 1)))
            setHasta(hoy)
          }} className="btn-secondary btn-sm">Este mes</button>
        </div>
        {isAdmin && (
          <button onClick={() => setSoloMios(s => !s)}
            className={soloMios ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}>
            {soloMios ? '👤 Solo las mías' : '👥 Todas'}
          </button>
        )}
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th className="w-12">#</th><th>Cliente</th><th className="w-28">Fecha</th><th className="w-32">Tipo pago</th><th className="text-right w-36">Total</th><th className="text-right w-36">Pagado</th><th className="text-right w-36">Pendiente</th><th className="w-28">Estado</th><th className="w-20"></th></tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan={9} className="text-center py-10" style={{ color:'var(--text-muted)' }}>Cargando...</td></tr>
            : list.length===0 ? <tr><td colSpan={9} className="text-center py-12"><FileText size={28} className="mx-auto mb-2" style={{ color:'var(--text-muted)' }}/><p style={{ color:'var(--text-muted)' }}>No hay facturas</p></td></tr>
            : list.map(f => (
              <tr key={f.facturaId}>
                <td className="font-bold text-sm" style={{ color:'var(--brand)' }}>#{f.facturaId}</td>
                <td className="font-medium text-sm">{f.nombreCliente}</td>
                <td className="text-sm" style={{ color:'var(--text-secondary)' }}>{new Date(f.fecha).toLocaleDateString('es-DO')}</td>
                <td><span className="badge badge-gray">{f.tipoPago}</span></td>
                <td className="text-right"><span className="font-bold text-sm tabular-nums">{fmt(f.total)}</span></td>
                <td className="text-right"><span className="font-semibold text-sm tabular-nums text-green-500">{fmt(f.pagado)}</span></td>
                 <td className="text-right">{(f.total-f.pagado)>0 ? <span className="font-semibold text-sm tabular-nums text-red-500">{fmt(f.total-f.pagado)}</span> : <span style={{ color:'var(--text-muted)' }}>—</span>}</td>
                <td>{ESTADO[f.estado]}</td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => setModal({ ver: f.facturaId })} className="btn-ghost btn-icon btn-sm" title="Ver"><Eye size={14}/></button>
                    <button onClick={() => {
                      api.get(`/api/facturas/${f.facturaId}`).then(r => {
                        Promise.all([
                          api.get('/api/empresa').then(x => x.data),
                          api.get('/api/empresa/control').then(x => x.data),
                        ]).then(([emp, ctrl]) => printFactura(r.data, emp, ctrl))
                      })
                    }} className="btn-ghost btn-icon btn-sm" title="Imprimir"><Printer size={14}/></button>
                    {(f.estado===3||f.estado===1) && (f.total-f.pagado)>0 && (
                      <button onClick={() => setCobroFactura(f)} className="btn-ghost btn-icon btn-sm text-green-500" title="Cobrar"><DollarSign size={14}/></button>
                    )}
                    {f.estado!==0 && <button onClick={() => { if(confirm('¿Cancelar esta factura?')) cancelar.mutate(f.facturaId) }} className="btn-ghost btn-icon btn-sm text-red-400" title="Cancelar"><XCircle size={14}/></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === 'nueva' && <NuevaFacturaModal onClose={() => setModal(null)} onSave={create.mutate} busy={create.isPending} />}
      {modal?.ver && <FacturaDetalle facturaId={modal.ver} onClose={() => setModal(null)} />}

      {/* Modal cobro — aparece tras crear factura o al clickar cobrar en la lista */}
      {cobroFactura && (
        <CobroModal
          factura={cobroFactura}
          onClose={() => { setCobroFactura(null); qc.invalidateQueries(['facturas']) }}
          onCobrar={saldar.mutate}
          busy={saldar.isPending}
        />
      )}
    </div>
  )
}
