import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit2, Package, AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '../lib/api'
import toast from 'react-hot-toast'

const fmt = (v) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v || 0)

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

function Modal({ prod, cats, onClose, onSave, busy }) {
  const [confirmCancel, setConfirmCancel] = useState(false)
  const isEdit = !!prod?.productoId
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    defaultValues: prod || {
      itbis: 0,
      cantidad: '', minimo: '', precio2: '', precio3: '', costo: '', precio1: '',
    },
  })

  const closeWithConfirm = () => {
    if (!isDirty && !isEdit) { onClose(); return }
    setConfirmCancel(true)
  }

  const submit = (d) => onSave({
    ...d,
    empresaId:   1,
    categoriaId: parseInt(d.categoriaId),
    cantidad:    parseFloat(d.cantidad  || 0),
    costo:       parseFloat(d.costo     || 0),
    minimo:      parseInt(d.minimo      || 0),
    precio1:     parseFloat(d.precio1   || 0),
    precio2:     parseFloat(d.precio2   || 0),
    precio3:     parseFloat(d.precio3   || 0),
    itbis:       parseInt(d.itbis),
  })

  // Helper: combina register con props de NumInput
  const numField = (name, opts = {}) => {
    const { decimals = true, required, className = 'input' } = opts
    return { decimals, className, ...register(name, required ? { required: 'Requerido' } : {}) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeWithConfirm()}>
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {isEdit ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={closeWithConfirm} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Descripción *</label>
            <input
              className={`input ${errors.descripcion ? 'input-error' : ''}`}
              placeholder="Nombre del producto"
              {...register('descripcion', { required: 'Requerido', maxLength: 100 })}
            />
            {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion.message}</p>}
          </div>

          <div>
            <label className="label">Categoría *</label>
            <select className={`input ${errors.categoriaId ? 'input-error' : ''}`}
              {...register('categoriaId', { required: 'Requerido' })}>
              <option value="">Seleccionar...</option>
              {cats?.filter(c => c.estado === 1).map(c => (
                <option key={c.categoriaId} value={c.categoriaId}>{c.descripcion}</option>
              ))}
            </select>
            {errors.categoriaId && <p className="text-red-500 text-xs mt-1">{errors.categoriaId.message}</p>}
          </div>

          <div>
            <label className="label">Referencia</label>
            <input className="input" placeholder="Código interno" {...register('referencia')} />
          </div>

          <div>
            <label className="label">Cantidad</label>
            <NumInput {...numField('cantidad')} />
          </div>

          <div>
            <label className="label">Stock mínimo</label>
            <NumInput {...numField('minimo', { decimals: false })} />
          </div>

          <div>
            <label className="label">Costo *</label>
            <NumInput {...numField('costo', { required: true, className: `input ${errors.costo ? 'input-error' : ''}` })} />
            {errors.costo && <p className="text-red-500 text-xs mt-1">{errors.costo.message}</p>}
          </div>

          <div>
            <label className="label">Precio 1 *</label>
            <NumInput {...numField('precio1', { required: true, className: `input ${errors.precio1 ? 'input-error' : ''}` })} />
            {errors.precio1 && <p className="text-red-500 text-xs mt-1">{errors.precio1.message}</p>}
          </div>

          <div>
            <label className="label">Precio 2</label>
            <NumInput {...numField('precio2')} />
          </div>

          <div>
            <label className="label">Precio 3</label>
            <NumInput {...numField('precio3')} />
          </div>

          <div>
            <label className="label">ITBIS</label>
            <select className="input" {...register('itbis')}>
              <option value={0}>Exento</option>
              <option value={1}>Gravado (18%)</option>
            </select>
          </div>

          <div>
            <label className="label">Código de barra</label>
            <input className="input" placeholder="EAN / UPC" {...register('codigoBarra')} />
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
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirmCancel(false)}>
          <div className="modal-box max-w-md">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>¿Deseas cancelar el registro?</h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Perderás los cambios no guardados.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setConfirmCancel(false)}>No</button>
              <button className="btn-primary" onClick={() => { setConfirmCancel(false); onClose() }}>Sí, cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function ProductosPage() {
  const [search,  setSearch]  = useState('')
  const [catFilt, setCatFilt] = useState('')
  const [modal,   setModal]   = useState(null)
  const qc = useQueryClient()

  const { data: prods = [], isLoading } = useQuery({
    queryKey: ['productos'],
    queryFn:  () => api.get('/api/productos').then(r => r.data),
  })

  const { data: cats = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn:  () => api.get('/api/categorias').then(r => r.data),
  })

  const create = useMutation({
    mutationFn: (d) => api.post('/api/productos', d),
    onSuccess:  () => { qc.invalidateQueries(['productos']); toast.success('Producto creado'); setModal(null) },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const update = useMutation({
    mutationFn: (d) => api.put(`/api/productos/${d.productoId}`, d),
    onSuccess:  () => { qc.invalidateQueries(['productos']); toast.success('Actualizado'); setModal(null) },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const busy = create.isPending || update.isPending

  const handleSave = (d) => {
    if (modal?.productoId) update.mutate({ ...d, productoId: modal.productoId })
    else create.mutate(d)
  }

  const list = prods.filter(p => {
    const q = search.toLowerCase()
    const mQ = !q || p.descripcion.toLowerCase().includes(q) || p.referencia?.toLowerCase().includes(q) || p.codigoBarra?.includes(q)
    const mC = !catFilt || p.categoriaId === parseInt(catFilt)
    return mQ && mC
  })

  const stockBajoCount = prods.filter(p => p.cantidad <= p.minimo).length

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Productos</h1>
          <p className="page-sub">
            {prods.length} productos · {stockBajoCount > 0 && <span className="text-red-500">{stockBajoCount} con stock bajo</span>}
          </p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary">
          <Plus size={15} /> Nuevo producto
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input pl-8 w-64" placeholder="Buscar descripción, referencia..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-48" value={catFilt} onChange={e => setCatFilt(e.target.value)}>
          <option value="">Todas las categorías</option>
          {cats.map(c => <option key={c.categoriaId} value={c.categoriaId}>{c.descripcion}</option>)}
        </select>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Stock</th>
              <th>Costo</th>
              <th>Precio 1</th>
              <th>Precio 2</th>
              <th>ITBIS</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Cargando...</td></tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12">
                  <Package size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-muted)' }}>No hay productos</p>
                </td>
              </tr>
            ) : list.map(p => (
              <tr key={p.productoId}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <Package size={14} style={{ color: 'var(--brand)' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{p.descripcion}</p>
                      {p.referencia && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.referencia}</p>}
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-gray">{p.categoria}</span></td>
                <td>
                  <div className="flex items-center gap-1">
                    {p.cantidad <= p.minimo && <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />}
                    <span className={`font-semibold text-sm ${p.cantidad <= p.minimo ? 'text-red-500' : ''}`}>
                      {p.cantidad}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/ mín {p.minimo}</span>
                  </div>
                </td>
                <td className="text-sm">{fmt(p.costo)}</td>
                <td className="font-semibold text-sm">{fmt(p.precio1)}</td>
                <td className="text-sm">{p.precio2 > 0 ? fmt(p.precio2) : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                <td>
                  <span className={p.itbis === 1 ? 'badge badge-blue' : 'badge badge-gray'}>
                    {p.itbis === 1 ? '18%' : 'Exento'}
                  </span>
                </td>
                <td>
                  <button onClick={() => setModal(p)} className="btn-ghost btn-icon btn-sm"><Edit2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== null && (
        <Modal
          prod={modal?.productoId ? modal : null}
          cats={cats}
          onClose={() => setModal(null)}
          onSave={handleSave}
          busy={busy}
        />
      )}
    </div>
  )
}