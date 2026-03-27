import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit2, Phone, Mail, CreditCard, ToggleLeft, ToggleRight, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '../lib/api'
import toast from 'react-hot-toast'

const fmt = (v) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v || 0)

const TIPO = ['Regular', 'Crédito', 'Mayorista']

function Modal({ cliente, onClose, onSave, busy }) {
  const [confirmCancel, setConfirmCancel] = useState(false)
  const isEdit = !!cliente?.clienteId
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    defaultValues: cliente || { tipo: 0, credito: 0, sexo: 'true' },
  })

  const closeWithConfirm = () => {
    if (!isDirty && !isEdit) {
      onClose()
      return
    }
    setConfirmCancel(true)
  }

  const cancelConfirmed = () => {
    setConfirmCancel(false)
    onClose()
  }

  const cancelDismiss = () => {
    setConfirmCancel(false)
  }

  const submit = (d) => onSave({
    ...d,
    empresaId:       1,
    tipo:            parseInt(d.tipo),
    credito:         parseFloat(d.credito || 0),
    sexo:            d.sexo === 'true' || d.sexo === true,
    fechaNacimiento: d.fechaNacimiento || null,
  })

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeWithConfirm()}>
      <div className="modal-box max-w-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {isEdit ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <button onClick={closeWithConfirm} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Nombre *</label>
            <input className={`input ${errors.nombre ? 'input-error' : ''}`} placeholder="Juan Pérez"
              {...register('nombre', { required: 'Requerido', maxLength: 75 })} />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
          </div>

          <div>
            <label className="label">Teléfono</label>
            <input className="input" placeholder="809-000-0000" {...register('telefono')} />
          </div>

          <div>
            <label className="label">Correo</label>
            <input type="email" className="input" placeholder="cliente@mail.com"
              {...register('email', { pattern: { value: /\S+@\S+\.\S+/, message: 'Inválido' } })} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Cédula / RNC</label>
            <input className="input" placeholder="000-0000000-0" {...register('cedula')} />
          </div>

          <div>
            <label className="label">Tipo</label>
            <select className="input" {...register('tipo')}>
              <option value={0}>Regular</option>
              <option value={1}>Crédito</option>
              <option value={2}>Mayorista</option>
            </select>
          </div>

          <div>
            <label className="label">Límite crédito (RD$)</label>
            <input type="number" step="0.01" className="input" placeholder="0.00" {...register('credito')} />
          </div>

          <div>
            <label className="label">Sexo</label>
            <select className="input" {...register('sexo')}>
              <option value="true">Masculino</option>
              <option value="false">Femenino</option>
            </select>
          </div>

          <div>
            <label className="label">Fecha nacimiento</label>
            <input type="date" className="input" {...register('fechaNacimiento')} />
          </div>

          <div className="col-span-2">
            <label className="label">Dirección</label>
            <input className="input" placeholder="Calle Principal #1" {...register('direccion')} />
          </div>

          <div className="col-span-2 flex gap-3 pt-1">
            <button type="button" onClick={closeWithConfirm} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">
              {busy ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>

      {confirmCancel && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && cancelDismiss()}>
          <div className="modal-box max-w-md">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>¿Deseas cancelar el registro?</h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Se perderán los cambios no guardados.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-secondary" onClick={cancelDismiss}>No</button>
              <button className="btn-primary" onClick={cancelConfirmed}>Sí, cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function ClientesPage() {
  const [search, setSearch]   = useState('')
  const [filtro, setFiltro]   = useState('todos')
  const [modal, setModal]     = useState(null)
  const qc = useQueryClient()

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn:  () => api.get('/api/clientes').then(r => r.data),
  })

  const create = useMutation({
    mutationFn: (d) => api.post('/api/clientes', d),
    onSuccess:  () => { qc.invalidateQueries(['clientes']); toast.success('Cliente creado'); setModal(null) },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const update = useMutation({
    mutationFn: (d) => api.put(`/api/clientes/${d.clienteId}`, d),
    onSuccess:  () => { qc.invalidateQueries(['clientes']); toast.success('Actualizado'); setModal(null) },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const toggle = useMutation({
    mutationFn: (id) => api.patch(`/api/clientes/${id}/toggle-estado`),
    onSuccess:  () => qc.invalidateQueries(['clientes']),
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const busy = create.isPending || update.isPending

  const handleSave = (d) => d.clienteId ? update.mutate(d) : create.mutate(d)

  const list = clientes.filter(c => {
    const q = search.toLowerCase()
    const matchQ = !q || c.nombre.toLowerCase().includes(q) || c.telefono?.includes(q) || c.cedula?.includes(q)
    const matchF = filtro === 'todos' || (filtro === 'activos' && c.estado === 1) || (filtro === 'inactivos' && c.estado === 0)
    return matchQ && matchF
  })

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-sub">{clientes.length} registrados</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary">
          <Plus size={15} /> Nuevo cliente
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          ['Total',     clientes.length,                         'var(--text-primary)'],
          ['Activos',   clientes.filter(c=>c.estado===1).length, '#22c55e'],
          ['Inactivos', clientes.filter(c=>c.estado===0).length, 'var(--text-muted)'],
        ].map(([l, v, color]) => (
          <div key={l} className="card text-center py-3">
            <p className="text-xl font-extrabold" style={{ color }}>{v}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{l}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input pl-8 w-64" placeholder="Buscar nombre, teléfono, cédula..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5">
          {['todos','activos','inactivos'].map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={filtro === f ? 'btn-primary btn-sm capitalize' : 'btn-secondary btn-sm capitalize'}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Contacto</th>
              <th>Cédula / RNC</th>
              <th>Tipo</th>
              <th>Crédito</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Cargando...</td></tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <User size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-muted)' }}>No hay clientes</p>
                </td>
              </tr>
            ) : list.map(c => (
              <tr key={c.clienteId}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: `hsl(${(c.clienteId * 53) % 360},55%,48%)` }}>
                      {c.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{c.nombre}</p>
                      {c.direccion && <p className="text-xs truncate max-w-[160px]" style={{ color: 'var(--text-muted)' }}>{c.direccion}</p>}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="space-y-1">
                    {c.telefono && <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}><Phone size={11}/>{c.telefono}</div>}
                    {c.email    && <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}><Mail size={11}/>{c.email}</div>}
                  </div>
                </td>
                <td>
                  {c.cedula
                    ? <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}><CreditCard size={13}/>{c.cedula}</div>
                    : <span style={{ color: 'var(--text-muted)' }}>—</span>
                  }
                </td>
                <td>
                  <span className={c.tipo===1?'badge badge-blue':c.tipo===2?'badge badge-yellow':'badge badge-gray'}>
                    {TIPO[c.tipo]||'Regular'}
                  </span>
                </td>
                <td className="font-semibold text-sm">
                  {c.credito>0 ? <span className="text-green-500">{fmt(c.credito)}</span> : <span style={{ color:'var(--text-muted)' }}>—</span>}
                </td>
                <td>
                  {c.estado===1
                    ? <span className="badge badge-green">Activo</span>
                    : <span className="badge badge-gray">Inactivo</span>
                  }
                </td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => setModal(c)} className="btn-ghost btn-icon btn-sm" title="Editar">
                      <Edit2 size={14}/>
                    </button>
                    <button onClick={() => toggle.mutate(c.clienteId)} className="btn-ghost btn-icon btn-sm"
                      title={c.estado===1?'Desactivar':'Activar'}>
                      {c.estado===1
                        ? <ToggleRight size={18} className="text-green-500"/>
                        : <ToggleLeft  size={18} style={{ color:'var(--text-muted)' }}/>
                      }
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== null && (
        <Modal
          cliente={modal?.clienteId ? modal : null}
          onClose={() => setModal(null)}
          onSave={handleSave}
          busy={busy}
        />
      )}
    </div>
  )
}
