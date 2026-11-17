import { useForm } from 'react-hook-form';

const numOrNull = (v) =>
  v === '' || v === null || v === undefined || Number.isNaN(v) ? null : Number(v);

export function EscuelaModal({ escuela, onClose, busy, onSave }) {
  const { register, handleSubmit } = useForm({
    defaultValues: escuela
      ? {
          ...escuela,
          cantidadEstudiante: escuela.cantidadEstudiante ?? '',
          orden: escuela.orden ?? '',
          estado: escuela.estado ?? true,
        }
      : { estado: true, cantidadEstudiante: '', orden: '' },
  });

  const submit = (d) =>
    onSave({
      codigo: d.codigo || null,
      institucion: d.institucion || null,
      nombre: d.nombre,
      encargado: d.encargado || null,
      director: d.director || null,
      direccion: d.direccion || null,
      telefono: d.telefono || null,
      rnc: d.rnc || null,
      provincia: d.provincia || null,
      municipio: d.municipio || null,
      distrito: d.distrito || null,
      cantidadEstudiante: numOrNull(d.cantidadEstudiante),
      orden: numOrNull(d.orden),
      estado: Boolean(d.estado),
    });

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {escuela?.escuelaId ? 'Editar escuela' : 'Nueva escuela'}
          </h2>
          <button type="button" onClick={onClose} className="btn-ghost btn-icon">×</button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label">Código</label>
              <input className="input" placeholder="Código interno" {...register('codigo', { maxLength: 50 })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Institución</label>
              <input className="input" placeholder="Institución a la que pertenece" {...register('institucion', { maxLength: 200 })} />
            </div>
          </div>

          <div>
            <label className="label">Nombre *</label>
            <input className="input" placeholder="Nombre de la escuela" {...register('nombre', { required: true, maxLength: 200 })} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Encargado</label>
              <input className="input" placeholder="Responsable" {...register('encargado', { maxLength: 200 })} />
            </div>
            <div>
              <label className="label">Director</label>
              <input className="input" {...register('director', { maxLength: 200 })} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Teléfono</label>
              <input className="input" {...register('telefono', { maxLength: 30 })} />
            </div>
            <div>
              <label className="label">RNC</label>
              <input className="input" {...register('rnc', { maxLength: 20 })} />
            </div>
          </div>

          <div>
            <label className="label">Dirección</label>
            <input className="input" {...register('direccion', { maxLength: 300 })} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label">Provincia</label>
              <input className="input" {...register('provincia', { maxLength: 100 })} />
            </div>
            <div>
              <label className="label">Municipio</label>
              <input className="input" {...register('municipio', { maxLength: 100 })} />
            </div>
            <div>
              <label className="label">Distrito</label>
              <input className="input" {...register('distrito', { maxLength: 100 })} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label">Cantidad estudiantes</label>
              <input type="number" min="0" className="input" {...register('cantidadEstudiante')} />
            </div>
            <div>
              <label className="label">Orden</label>
              <input type="number" min="0" className="input" {...register('orden')} />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Menor número aparece primero.</p>
            </div>
            <div>
              <label className="label">Estado</label>
              <label className="flex items-center gap-2 h-[38px] px-3 rounded-lg border cursor-pointer" style={{ borderColor: 'var(--border)' }}>
                <input type="checkbox" {...register('estado')} />
                <span className="text-sm">Activa</span>
              </label>
            </div>
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
