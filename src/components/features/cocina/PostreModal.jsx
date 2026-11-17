import { useForm } from 'react-hook-form';

export function PostreModal({ postre, onClose, busy, onSave }) {
  const { register, handleSubmit } = useForm({
    defaultValues: postre
      ? {
          nombre: postre.nombre ?? '',
          costo: postre.costo ?? 0,
          estado: postre.estado ?? true,
        }
      : { nombre: '', costo: '', estado: true },
  });

  const submit = (d) =>
    onSave({
      nombre: d.nombre,
      costo: Number(d.costo) || 0,
      estado: Boolean(d.estado),
    });

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {postre?.postreId ? 'Editar postre' : 'Nuevo postre'}
          </h2>
          <button type="button" onClick={onClose} className="btn-ghost btn-icon">×</button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <label className="label">Nombre *</label>
            <input
              className="input"
              placeholder="Nombre del postre"
              {...register('nombre', { required: true, maxLength: 200 })}
            />
          </div>
          <div>
            <label className="label">Costo</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input text-right"
              placeholder="0.00"
              {...register('costo', { min: 0 })}
            />
          </div>
          <div>
            <label className="label">Estado</label>
            <label className="flex items-center gap-2 h-[38px] px-3 rounded-lg border cursor-pointer" style={{ borderColor: 'var(--border)' }}>
              <input type="checkbox" {...register('estado')} />
              <span className="text-sm">Activo</span>
            </label>
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
  );
}
