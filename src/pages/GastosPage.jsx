import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Eye, DollarSign, Tag, Trash2 } from 'lucide-react'
import { useForm, useFieldArray } from 'react-hook-form'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

const fmt = (v) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v || 0)

// ── Modal gestión de conceptos ───────────────────────────────────
function ConceptosModal({ onClose }) {
  const qc = useQueryClient()
  const [nuevo, setNuevo] = useState('')

  const { data: conceptos = [], isLoading } = useQuery({
    queryKey: ['consumos-gastos'],
    queryFn:  () => api.get('/api/gastos/consumos').then(r => r.data),
  })

  const crear = useMutation({
    mutationFn: (d) => api.post('/api/gastos/consumos', d),
    onSuccess:  () => { qc.invalidateQueries(['consumos-gastos']); setNuevo(''); toast.success('Concepto creado') },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const handleCrear = () => {
    if (!nuevo.trim()) return
    crear.mutate({ descripcion: nuevo.trim() })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-md">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Conceptos de gasto</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Administra los conceptos disponibles</p>
          </div>
          <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
        </div>

        {/* Agregar nuevo */}
        <div className="flex gap-2 mb-5">
          <input
            className="input flex-1"
            placeholder="Ej: Agua, Luz, Teléfono, Gasolina..."
            value={nuevo}
            onChange={e => setNuevo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCrear()}
          />
          <button
            onClick={handleCrear}
            disabled={crear.isPending || !nuevo.trim()}
            className="btn-primary px-4">
            <Plus size={15} />
          </button>
        </div>

        {/* Lista */}
        {isLoading ? (
          <p className="text-center py-6 text-sm" style={{ color: 'var(--text-muted)' }}>Cargando...</p>
        ) : conceptos.length === 0 ? (
          <div className="text-center py-8">
            <Tag size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No hay conceptos. Crea el primero arriba.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {conceptos.map(c => (
              <div key={c.consumosGastosId}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <Tag size={12} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {c.descripcion}
                  </span>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>#{c.consumosGastosId}</span>
              </div>
            ))}
          </div>
        )}

        <button onClick={onClose} className="btn-secondary w-full mt-5">Cerrar</button>
      </div>
    </div>
  )
}

// ── Detalle gasto ────────────────────────────────────────────────
function GastoDetalle({ gastoId, onClose }) {
  const { data: g, isLoading } = useQuery({
    queryKey: ['gasto', gastoId],
    queryFn:  () => api.get(`/api/gastos/${gastoId}`).then(r => r.data),
  })
  if (isLoading) return (
    <div className="modal-overlay">
      <div className="modal-box max-w-lg flex items-center justify-center py-12">
        <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
      </div>
    </div>
  )
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-lg">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Gasto #{g?.gastosId}</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {new Date(g?.fecha).toLocaleDateString('es-DO', { dateStyle: 'full' })}
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[['Usuario', g?.usuario], ['Total', fmt(g?.total)]].map(([l, v]) => (
            <div key={l} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{l}</p>
              <p className="font-semibold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{v}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2 mb-5">
          {g?.detalles?.map((d, i) => (
            <div key={i} className="flex justify-between items-center p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{d.descripcion}</span>
              <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt(d.monto)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t pt-4" style={{ borderColor: 'var(--border)' }}>
          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
          <span className="text-xl font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt(g?.total)}</span>
        </div>
        <button onClick={onClose} className="btn-secondary w-full mt-5">Cerrar</button>
      </div>
    </div>
  )
}

// ── Nuevo gasto ──────────────────────────────────────────────────
function NuevoGastoModal({ onClose, onSave, busy }) {
  const { user } = useAuthStore()
  const [consumoSearch, setConsumoSearch] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(false)
  const { handleSubmit, watch, control, register, formState: { isDirty } } = useForm({
    defaultValues: { detalles: [] }
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'detalles' })

  const { data: consumos = [] } = useQuery({
    queryKey: ['consumos-search', consumoSearch],
    queryFn:  () => consumoSearch.length >= 1
      ? api.get(`/api/gastos/consumos/search?q=${consumoSearch}`).then(r => r.data)
      : [],
    enabled: consumoSearch.length >= 1,
  })

  // Si no hay resultados pero hay texto, también busca en todos
  const { data: todosConsumos = [] } = useQuery({
    queryKey: ['consumos-gastos'],
    queryFn:  () => api.get('/api/gastos/consumos').then(r => r.data),
  })

  const resultados = consumoSearch.length >= 1 ? consumos : []
  // También filtrar localmente por si el search del backend no funciona
  const resultadosFiltrados = resultados.length > 0
    ? resultados
    : consumoSearch.length >= 1
      ? todosConsumos.filter(c => c.descripcion.toLowerCase().includes(consumoSearch.toLowerCase()))
      : []

  const detalles = watch('detalles')
  const total    = detalles.reduce((s, d) => s + parseFloat(d.monto || 0), 0)

  const agregarConsumo = (c) => {
    // No agregar duplicados
    if (fields.some(f => f.consumosGastosId === c.consumosGastosId)) {
      toast.error('Ya agregaste ese concepto')
      return
    }
    append({ consumosGastosId: c.consumosGastosId, descripcion: c.descripcion, monto: 0 })
    setConsumoSearch('')
  }

  const closeWithConfirm = () => {
    if (isDirty || detalles?.length > 0) setConfirmCancel(true)
    else onClose()
  }

  const submit = (data) => {
    if (fields.length === 0) { toast.error('Agrega al menos un concepto'); return }
    onSave({
      usuarioId: user?.usuarioId,
      detalles:  data.detalles.map(d => ({
        consumosGastosId: d.consumosGastosId,
        monto: parseFloat(d.monto),
      })),
    })
  }

  return (
    <>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeWithConfirm()}>
        <div className="modal-box max-w-2xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Nuevo gasto</h2>
            <button onClick={closeWithConfirm} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
          </div>

          <form onSubmit={handleSubmit(submit)} className="space-y-5">
            <div>
              <label className="label">Agregar concepto</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input className="input pl-8" placeholder="Buscar concepto de gasto..."
                  value={consumoSearch} onChange={e => setConsumoSearch(e.target.value)} />
                {resultadosFiltrados.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 rounded-lg border shadow-lg overflow-hidden"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    {resultadosFiltrados.map(c => (
                      <button key={c.consumosGastosId} type="button"
                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-[var(--bg-tertiary)] flex items-center gap-2"
                        onClick={() => agregarConsumo(c)}>
                        <Tag size={12} style={{ color: 'var(--text-muted)' }} />
                        {c.descripcion}
                      </button>
                    ))}
                  </div>
                )}
                {consumoSearch.length >= 1 && resultadosFiltrados.length === 0 && (
                  <div className="absolute z-20 w-full mt-1 rounded-lg border shadow-lg overflow-hidden"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <p className="px-3 py-2.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                      No encontrado. Ve a "Conceptos" para crear uno nuevo.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {fields.length > 0 ? (
              <div className="space-y-2">
                {fields.map((f, i) => (
                  <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg border"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-tertiary)' }}>
                    <Tag size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <span className="flex-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {f.descripcion}
                    </span>
                    <input type="number" step="0.01" min="0"
                      className="input w-36 text-right py-1.5 text-sm font-bold"
                      placeholder="0.00"
                      {...register(`detalles.${i}.monto`)} />
                    <button type="button" onClick={() => remove(i)}
                      className="btn-ghost btn-icon btn-sm text-red-400 hover:text-red-600 flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed gap-2"
                style={{ borderColor: 'var(--border)' }}>
                <Tag size={20} style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Busca y agrega conceptos de gasto
                </p>
              </div>
            )}

            {fields.length > 0 && (
              <div className="flex justify-end">
                <div className="flex justify-between w-64 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
                  <span className="text-2xl font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                    {fmt(total)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={closeWithConfirm} className="btn-secondary flex-1">Cancelar</button>
              <button type="submit" disabled={busy || fields.length === 0} className="btn-primary flex-1">
                {busy ? 'Guardando...' : 'Registrar gasto'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {confirmCancel && (
        <div className="modal-overlay">
          <div className="modal-box max-w-sm">
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>¿Descartar gasto?</h3>
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
export function GastosPage() {
  const [search, setSearch] = useState('')
  const [modal,  setModal]  = useState(null)
  const qc = useQueryClient()

  const { data: gastos = [], isLoading } = useQuery({
    queryKey: ['gastos'],
    queryFn:  () => api.get('/api/gastos').then(r => r.data),
  })

  const create = useMutation({
    mutationFn: (d) => api.post('/api/gastos', d),
    onSuccess:  () => { qc.invalidateQueries(['gastos']); toast.success('Gasto registrado'); setModal(null) },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const list     = gastos.filter(g => {
    const q = search.toLowerCase()
    return !q || g.usuario?.toLowerCase().includes(q) || String(g.gastosId).includes(q)
  })
  const totalMes = gastos.reduce((s, g) => s + g.total, 0)

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gastos</h1>
          <p className="page-sub">{gastos.length} gastos registrados</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModal('conceptos')} className="btn-secondary">
            <Tag size={15} /> Conceptos
          </button>
          <button onClick={() => setModal('nuevo')} className="btn-primary">
            <Plus size={15} /> Nuevo gasto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20">
            <DollarSign size={18} className="text-red-500" />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total gastos</p>
            <p className="text-lg font-extrabold text-red-500">{fmt(totalMes)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800">
            <Tag size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Registros</p>
            <p className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>{gastos.length}</p>
          </div>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input className="input pl-8" placeholder="Buscar usuario o #..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="tbl-wrap">
        <table className="tbl table-fixed w-full">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th className="w-44">Usuario</th>
              <th className="w-28">Fecha</th>
              <th className="w-20 text-center">Conceptos</th>
              <th className="w-32 text-right">Total</th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? <tr><td colSpan={6} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Cargando...</td></tr>
              : list.length === 0
                ? <tr><td colSpan={6} className="text-center py-12">
                    <DollarSign size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                    <p style={{ color: 'var(--text-muted)' }}>No hay gastos</p>
                  </td></tr>
                : list.map(g => (
                    <tr key={g.gastosId}>
                      <td className="font-bold text-sm" style={{ color: 'var(--brand)' }}>#{g.gastosId}</td>
                      <td className="font-medium text-sm truncate">{g.usuario}</td>
                      <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(g.fecha).toLocaleDateString('es-DO')}
                      </td>
                      <td className="text-center">
                        <span className="badge badge-gray">{g.detalles?.length || '—'}</span>
                      </td>
                      <td className="text-right font-semibold text-sm tabular-nums">{fmt(g.total)}</td>
                      <td>
                        <button onClick={() => setModal({ ver: g.gastosId })}
                          className="btn-ghost btn-icon btn-sm">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
            }
          </tbody>
        </table>
      </div>

      {modal === 'nuevo'     && <NuevoGastoModal onClose={() => setModal(null)} onSave={create.mutate} busy={create.isPending} />}
      {modal === 'conceptos' && <ConceptosModal  onClose={() => setModal(null)} />}
      {modal?.ver            && <GastoDetalle gastoId={modal.ver} onClose={() => setModal(null)} />}
    </div>
  )
}
