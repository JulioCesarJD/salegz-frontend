import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Eye, TrendingUp } from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

const fmt = (v) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v || 0)
const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

const DENOM = [
  { key: 'p1',    label: 'RD$1',     val: 1    },
  { key: 'p5',    label: 'RD$5',     val: 5    },
  { key: 'p10',   label: 'RD$10',    val: 10   },
  { key: 'p20',   label: 'RD$20',    val: 20   },
  { key: 'p25',   label: 'RD$25',    val: 25   },
  { key: 'p50',   label: 'RD$50',    val: 50   },
  { key: 'p100',  label: 'RD$100',   val: 100  },
  { key: 'p200',  label: 'RD$200',   val: 200  },
  { key: 'p500',  label: 'RD$500',   val: 500  },
  { key: 'p1000', label: 'RD$1,000', val: 1000 },
  { key: 'p2000', label: 'RD$2,000', val: 2000 },
]

const ESTADO_CUADRE = {
  0: <span className="badge badge-yellow">Pendiente</span>,
  1: <span className="badge badge-green">Aprobado</span>,
  2: <span className="badge badge-red">Con diferencia</span>,
}

// Input numérico como texto — vacío por defecto, solo acepta dígitos y punto decimal
function NumInput({ className, decimals = true, ...props }) {
  const handleKeyDown = (e) => {
    const allowed = ['Backspace','Delete','Tab','Escape','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End']
    if (allowed.includes(e.key)) return
    if (decimals && e.key === '.') return
    if (!/^\d$/.test(e.key)) e.preventDefault()
  }
  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text')
    const pattern = decimals ? /^\d*\.?\d*$/ : /^\d+$/
    if (!pattern.test(text)) e.preventDefault()
  }
  return (
    <input
      type="text"
      inputMode={decimals ? 'decimal' : 'numeric'}
      autoComplete="off"
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      className={className}
      {...props}
    />
  )
}

function CuadreDetalle({ cuadreId, onClose }) {
  const { data: c, isLoading } = useQuery({
    queryKey: ['cuadre', cuadreId],
    queryFn:  () => api.get(`/api/cuadres/${cuadreId}`).then(r => r.data),
  })
  if (isLoading) return (
    <div className="modal-overlay">
      <div className="modal-box max-w-lg flex items-center justify-center py-12">
        <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
      </div>
    </div>
  )

  const efectivo   = DENOM.reduce((s, d) => s + (c?.[d.key] || 0), 0)
  const diferencia = c?.diferencia || 0
  const difColor   = diferencia === 0 ? '#22c55e' : diferencia > 0 ? '#3b82f6' : '#ef4444'
  const difLabel   = diferencia === 0 ? 'Cuadre exacto ✓' : diferencia > 0 ? 'Sobrante' : 'Faltante'

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-lg">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Cuadre #{c?.cuadreId}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {new Date(c?.fecha).toLocaleDateString('es-DO', { dateStyle: 'full' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {ESTADO_CUADRE[c?.estadoCuadre ?? 0]}
            <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Cajero</p>
            <p className="font-semibold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{c?.usuario}</p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Turno</p>
            <p className="font-semibold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {c?.horaApertura || '—'} – {c?.horaCierre || '—'}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center p-3 rounded-lg mb-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Fondo inicial</span>
          <span className="font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt(c?.fondoInicial)}</span>
        </div>

        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
          Conteo de efectivo
        </p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {DENOM.filter((d) => (c?.[d.key] || 0) > 0).map((d) => (
            <div key={d.key} className="p-3 rounded-lg text-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{d.label}</p>
              <p className="font-bold text-sm tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt(c?.[d.key])}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t pt-4 mb-4" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
            Resumen de cobros
          </p>
          {[
            ['Efectivo contado', fmt(efectivo)],
            [`Cheques (${c?.cantidadCheque || 0})`, fmt(c?.totalCheque)],
            [`Tarjetas (${c?.cantidadTarjeta || 0})`, fmt(c?.totalTarjeta)],
            [`Transferencias (${c?.cantidadTransaccion || 0})`, fmt(c?.totalTransaccion)],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-muted)' }}>{l}</span>
              <span className="font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>{v}</span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-2" style={{ borderColor: 'var(--border)' }}>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Total cobrado</span>
            <span className="text-xl font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt(c?.total)}</span>
          </div>
        </div>

        <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
            Verificación vs sistema
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Ventas registradas</span>
              <span className="tabular-nums font-medium">{fmt(c?.ventasSistema)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Menos fondo inicial</span>
              <span className="tabular-nums font-medium text-red-500">– {fmt(c?.fondoInicial)}</span>
            </div>
            <div
              className="flex justify-between items-center p-2 rounded-lg mt-1"
              style={{ backgroundColor: diferencia === 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}
            >
              <span className="text-sm font-bold" style={{ color: difColor }}>{difLabel}</span>
              <span className="text-lg font-extrabold tabular-nums" style={{ color: difColor }}>
                {diferencia === 0 ? fmt(0) : `${diferencia > 0 ? '+' : ''}${fmt(Math.abs(diferencia))}`}
              </span>
            </div>
          </div>
        </div>

        {c?.notas && (
          <div className="p-3 rounded-lg mb-4" style={{ border: '1px solid var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Notas</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{c.notas}</p>
          </div>
        )}

        <button onClick={onClose} className="btn-secondary w-full">Cerrar</button>
      </div>
    </div>
  )
}

function NuevoCuadreModal({ onClose, onSave, busy }) {
  const { user } = useAuthStore()
  const hoy = localDate()

  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      // Todos los campos numéricos como string vacío
      ...Object.fromEntries([
        ...DENOM.map(d => [d.key, '']),
        ['totalCheque', ''], ['totalTarjeta', ''], ['totalTransaccion', ''],
        ['cantidadCheque', ''], ['cantidadTarjeta', ''], ['cantidadTransaccion', ''],
      ]),
      fondoInicial: '',
      horaApertura: '08:00',
      horaCierre:   new Date().toTimeString().slice(0, 5),
      notas: '',
    }
  })

  const { data: ventasData } = useQuery({
    queryKey: ['ventas-cuadre-hoy', user?.usuarioId],
    queryFn:  () => api.get(`/api/Reportes/ventas?desde=${hoy}&hasta=${hoy}`).then(r => r.data),
  })
  const ventasSistema = ventasData?.totalCobrado || 0

  const vals     = watch()
  const efectivo = DENOM.reduce((s, d) => s + (parseFloat(vals[d.key] || 0) * d.val), 0)
  const total    = efectivo + parseFloat(vals.totalCheque || 0) + parseFloat(vals.totalTarjeta || 0) + parseFloat(vals.totalTransaccion || 0)
  const diferencia = total - parseFloat(vals.fondoInicial || 0) - ventasSistema
  const difColor = diferencia === 0 ? '#22c55e' : diferencia > 0 ? '#3b82f6' : '#ef4444'

  const submit = (data) => {
    onSave({
      empresaId:           1,
      usuarioId:           user?.usuarioId,
      ...Object.fromEntries(DENOM.map(d => [d.key, parseFloat(data[d.key] || 0) * d.val])),
      totalCheque:         parseFloat(data.totalCheque       || 0),
      totalTarjeta:        parseFloat(data.totalTarjeta      || 0),
      totalTransaccion:    parseFloat(data.totalTransaccion  || 0),
      cantidadCheque:      parseInt(data.cantidadCheque      || 0),
      cantidadTarjeta:     parseInt(data.cantidadTarjeta     || 0),
      cantidadTransaccion: parseInt(data.cantidadTransaccion || 0),
      fondoInicial:        parseFloat(data.fondoInicial      || 0),
      horaApertura:        data.horaApertura,
      horaCierre:          data.horaCierre,
      notas:               data.notas,
    })
  }

  // Props comunes para NumInput con register
  const numField = (name, { decimals = true, className = '' } = {}) => ({
    decimals,
    className: `input ${className}`,
    ...register(name),
  })

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Nuevo cuadre de caja
          </h2>
          <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Hora apertura</label>
              <input type="time" className="input" {...register('horaApertura')} />
            </div>
            <div>
              <label className="label">Hora cierre</label>
              <input type="time" className="input" {...register('horaCierre')} />
            </div>
            <div>
              <label className="label">Fondo inicial</label>
              <NumInput {...numField('fondoInicial')} />
            </div>
          </div>

          <div>
            <p className="label mb-3">Conteo de efectivo</p>
            <div className="grid grid-cols-3 gap-3">
              {DENOM.map((d) => (
                <div key={d.key}>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.label}</label>
                    <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      = {fmt(parseFloat(vals[d.key] || 0) * d.val)}
                    </span>
                  </div>
                  <NumInput {...numField(d.key, { className: 'text-right py-1.5 text-sm' })} />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Total efectivo</span>
              <span className="font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt(efectivo)}</span>
            </div>
          </div>

          <div>
            <p className="label mb-3">Otros medios de pago</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Cheques',        cant: 'cantidadCheque',      monto: 'totalCheque'      },
                { label: 'Tarjetas',       cant: 'cantidadTarjeta',     monto: 'totalTarjeta'     },
                { label: 'Transferencias', cant: 'cantidadTransaccion', monto: 'totalTransaccion' },
              ].map((m) => (
                <div key={m.label} className="p-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>{m.label}</p>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Cantidad</label>
                      <NumInput {...numField(m.cant, { decimals: false, className: 'py-1.5 text-sm' })} />
                    </div>
                    <div>
                      <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Monto</label>
                      <NumInput {...numField(m.monto, { className: 'py-1.5 text-sm text-right' })} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
              Verificación vs sistema
            </p>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Total contado</span>
              <span className="font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Ventas sistema (cobrado hoy)</span>
              <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>{fmt(ventasSistema)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Menos fondo inicial</span>
              <span className="tabular-nums text-red-500">– {fmt(parseFloat(vals.fondoInicial || 0))}</span>
            </div>
            <div
              className="flex justify-between items-center p-3 rounded-lg mt-1"
              style={{ backgroundColor: diferencia === 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)' }}
            >
              <span className="font-bold text-sm" style={{ color: difColor }}>
                {diferencia === 0 ? 'Cuadre exacto ✓' : diferencia > 0 ? 'Sobrante' : 'Faltante'}
              </span>
              <span className="text-2xl font-extrabold tabular-nums" style={{ color: difColor }}>
                {diferencia === 0 ? fmt(0) : `${diferencia > 0 ? '+' : ''}${fmt(Math.abs(diferencia))}`}
              </span>
            </div>
          </div>

          <div>
            <label className="label">Notas (opcional)</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Ej: Sin incidencias. Un billete falso de RD$1,000 retenido..."
              {...register('notas')}
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">
              {busy ? 'Guardando...' : 'Guardar cuadre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function CuadresPage() {
  const [modal, setModal] = useState(null)
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const qc = useQueryClient()

  const { data: cuadres = [], isLoading } = useQuery({
    queryKey: ['cuadres', desde, hasta],
    queryFn: () => {
      const params = new URLSearchParams()
      if (desde) params.append('desde', desde)
      if (hasta) params.append('hasta', hasta)
      const qs = params.toString()
      return api.get(`/api/cuadres${qs ? `?${qs}` : ''}`).then(r => r.data)
    },
  })

  const create = useMutation({
    mutationFn: (d) => api.post('/api/cuadres', d),
    onSuccess:  () => { qc.invalidateQueries(['cuadres']); toast.success('Cuadre guardado'); setModal(null) },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cuadres de caja</h1>
          <p className="page-sub">{cuadres.length} cuadres registrados</p>
        </div>
        <button onClick={() => setModal('nuevo')} className="btn-primary">
          <Plus size={15} /> Nuevo cuadre
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Total',          cuadres.length,                                 'var(--text-primary)'],
          ['Aprobados',      cuadres.filter(c=>c.estadoCuadre===1).length,   '#22c55e'           ],
          ['Con diferencia', cuadres.filter(c=>c.estadoCuadre===2).length,   '#ef4444'           ],
          ['Pendientes',     cuadres.filter(c=>c.estadoCuadre===0).length,   '#f59e0b'           ],
        ].map(([l, v, color]) => (
          <div key={l} className="card text-center py-3">
            <p className="text-xl font-extrabold" style={{ color }}>{v}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{l}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="label">Desde</label>
          <input type="date" className="input w-36" value={desde} onChange={e => setDesde(e.target.value)} />
        </div>
        <div>
          <label className="label">Hasta</label>
          <input type="date" className="input w-36" value={hasta} onChange={e => setHasta(e.target.value)} />
        </div>
        <button onClick={() => { setDesde(''); setHasta('') }} className="btn-secondary btn-sm">Limpiar</button>
      </div>

      <div className="tbl-wrap">
        <table className="tbl table-fixed w-full">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th className="w-40">Cajero</th>
              <th className="w-32">Fecha</th>
              <th className="w-28 text-right">Fondo ini.</th>
              <th className="w-28 text-right">Ventas sis.</th>
              <th className="w-28 text-right">Total</th>
              <th className="w-28 text-right">Diferencia</th>
              <th className="w-28">Estado</th>
              <th className="w-14"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? <tr><td colSpan={9} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Cargando...</td></tr>
              : cuadres.length === 0
                ? <tr><td colSpan={9} className="text-center py-12">
                    <TrendingUp size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                    <p style={{ color: 'var(--text-muted)' }}>No hay cuadres</p>
                  </td></tr>
                : cuadres.map(c => {
                    const dif      = c.diferencia || 0
                    const difColor = dif === 0 ? 'var(--text-muted)' : dif > 0 ? '#3b82f6' : '#ef4444'
                    return (
                      <tr key={c.cuadreId}>
                        <td className="font-bold text-sm" style={{ color: 'var(--brand)' }}>#{c.cuadreId}</td>
                        <td className="font-medium text-sm truncate">{c.usuario}</td>
                        <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{new Date(c.fecha).toLocaleDateString('es-DO')}</td>
                        <td className="text-right text-sm tabular-nums" style={{ color: 'var(--text-secondary)' }}>{fmt(c.fondoInicial)}</td>
                        <td className="text-right text-sm tabular-nums" style={{ color: 'var(--text-secondary)' }}>{fmt(c.ventasSistema)}</td>
                        <td className="text-right font-semibold text-sm tabular-nums">{fmt(c.total)}</td>
                        <td className="text-right text-sm tabular-nums font-semibold" style={{ color: difColor }}>
                          {dif === 0 ? '—' : `${dif > 0 ? '+' : ''}${fmt(Math.abs(dif))}`}
                        </td>
                        <td>{ESTADO_CUADRE[c.estadoCuadre ?? 0]}</td>
                        <td>
                          <button onClick={() => setModal({ ver: c.cuadreId })} className="btn-ghost btn-icon btn-sm">
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
            }
          </tbody>
        </table>
      </div>

      {modal === 'nuevo' && <NuevoCuadreModal onClose={() => setModal(null)} onSave={create.mutate} busy={create.isPending} />}
      {modal?.ver && <CuadreDetalle cuadreId={modal.ver} onClose={() => setModal(null)} />}
    </div>
  )
}