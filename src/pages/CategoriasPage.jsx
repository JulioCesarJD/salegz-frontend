import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Tag, ToggleLeft, ToggleRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '../lib/api'
import toast from 'react-hot-toast'

function Modal({ cat, onClose, onSave, busy }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: cat || {},
  })
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {cat?.categoriaId ? 'Editar categoría' : 'Nueva categoría'}
          </h2>
          <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div>
            <label className="label">Descripción *</label>
            <input className={`input ${errors.descripcion ? 'input-error' : ''}`}
              placeholder="Ej: Electrónica"
              {...register('descripcion', { required: 'Requerido', maxLength: 100 })} />
            {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion.message}</p>}
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">
              {busy ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function CategoriasPage() {
  const [modal, setModal] = useState(null)
  const qc = useQueryClient()

  const { data: cats = [], isLoading } = useQuery({
    queryKey: ['categorias'],
    queryFn:  () => api.get('/api/categorias').then(r => r.data),
  })

  const create = useMutation({
    mutationFn: (d) => api.post('/api/categorias', { ...d, empresaId: 1 }),
    onSuccess:  () => { qc.invalidateQueries(['categorias']); toast.success('Categoría creada'); setModal(null) },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const update = useMutation({
    mutationFn: (d) => api.put(`/api/categorias/${d.categoriaId}`, d),
    onSuccess:  () => { qc.invalidateQueries(['categorias']); toast.success('Actualizada'); setModal(null) },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const toggle = useMutation({
    mutationFn: (id) => api.patch(`/api/categorias/${id}/toggle-estado`),
    onSuccess:  () => qc.invalidateQueries(['categorias']),
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const busy = create.isPending || update.isPending

  const handleSave = (d) => {
    if (modal?.categoriaId) update.mutate({ ...d, categoriaId: modal.categoriaId })
    else create.mutate(d)
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categorías</h1>
          <p className="page-sub">{cats.length} categorías</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary">
          <Plus size={15} /> Nueva categoría
        </button>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>#</th>
              <th>Descripción</th>
              <th>Productos</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Cargando...</td></tr>
            ) : cats.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <Tag size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-muted)' }}>No hay categorías</p>
                </td>
              </tr>
            ) : cats.map(c => (
              <tr key={c.categoriaId}>
                <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{c.categoriaId}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <Tag size={14} style={{ color: 'var(--brand)' }} />
                    </div>
                    <span className="font-semibold text-sm">{c.descripcion}</span>
                  </div>
                </td>
                <td><span className="badge badge-gray">—</span></td>
                <td>
                  {c.estado === 1
                    ? <span className="badge badge-green">Activa</span>
                    : <span className="badge badge-gray">Inactiva</span>
                  }
                </td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => setModal(c)} className="btn-ghost btn-icon btn-sm"><Edit2 size={14}/></button>
                    <button onClick={() => toggle.mutate(c.categoriaId)} className="btn-ghost btn-icon btn-sm">
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
        <Modal cat={modal?.categoriaId ? modal : null} onClose={() => setModal(null)} onSave={handleSave} busy={busy} />
      )}
    </div>
  )
}
