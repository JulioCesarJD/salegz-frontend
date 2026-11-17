import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ConduceDetallesEditor } from './ConduceDetallesEditor';
import { ESTADOS_CONDUCE } from '../../../models/conduces';

const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');

const toRow = (d) => ({
  recetaId: d.recetaId ?? '',
  porciones: d.porciones ?? 1,
  precioUnitario: d.precioUnitario ?? 0,
  costoUnitario: d.costoUnitario ?? 0,
  observaciones: d.observaciones ?? '',
});

const numOrNull = (v) =>
  v === '' || v === null || v === undefined || Number.isNaN(v) ? null : Number(v);

export function ConduceModal({
  conduce,
  escuelas = [],
  menu = [],
  postres = [],
  recetas = [],
  puedeEditarDetalles = true,
  onClose,
  busy,
  onSave,
}) {
  const { register, handleSubmit } = useForm({
    defaultValues: conduce
      ? {
          numeroConduce: conduce.numeroConduce ?? '',
          usuarioId: conduce.usuarioId ?? '',
          escuelaId: conduce.escuelaId ?? '',
          menuComidaId: conduce.menuComidaId ?? '',
          postreId: conduce.postreId ?? '',
          servicio: conduce.servicio ?? '',
          porciones: conduce.porciones ?? 0,
          fecha: toDateInput(conduce.fecha),
          observaciones: conduce.observaciones ?? '',
          edicionReceta: conduce.edicionReceta ?? '',
          edicionPostre: conduce.edicionPostre ?? '',
          estado: String(conduce.estado ?? 0),
        }
      : {
          numeroConduce: '',
          usuarioId: '',
          escuelaId: '',
          menuComidaId: '',
          postreId: '',
          servicio: '',
          porciones: 0,
          fecha: toDateInput(new Date().toISOString()),
          observaciones: '',
          edicionReceta: '',
          edicionPostre: '',
          estado: '0',
        },
  });

  const [detalles, setDetalles] = useState(() => (conduce?.detalles ?? []).map(toRow));
  const [error, setError] = useState('');

  const submit = (d) => {
    const filas = detalles.filter((x) => x.recetaId !== '' && x.recetaId !== null);
    if (filas.some((x) => !(Number(x.porciones) >= 0))) {
      setError('Las porciones no pueden ser negativas.');
      return;
    }
    setError('');
    onSave({
      numeroConduce: numOrNull(d.numeroConduce),
      usuarioId: numOrNull(d.usuarioId),
      escuelaId: numOrNull(d.escuelaId),
      menuComidaId: numOrNull(d.menuComidaId),
      postreId: numOrNull(d.postreId),
      servicio: d.servicio || null,
      porciones: Number(d.porciones) || 0,
      fecha: d.fecha || null,
      observaciones: d.observaciones || null,
      edicionReceta: d.edicionReceta || null,
      edicionPostre: d.edicionPostre || null,
      estado: Number(d.estado),
      detalles: filas.map((x) => ({
        recetaId: Number(x.recetaId),
        porciones: Number(x.porciones) || 0,
        precioUnitario: Number(x.precioUnitario) || 0,
        costoUnitario: Number(x.costoUnitario) || 0,
        observaciones: x.observaciones || null,
      })),
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {conduce?.conduceId ? 'Editar conduce' : 'Nuevo conduce'}
          </h2>
          <button type="button" onClick={onClose} className="btn-ghost btn-icon">×</button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="label"># Conduce</label>
              <input type="number" min="1" className="input" {...register('numeroConduce')} />
            </div>
            <div>
              <label className="label">Fecha</label>
              <input type="date" className="input" {...register('fecha')} />
            </div>
            <div>
              <label className="label">Estado</label>
              <select className="input" {...register('estado')}>
                {Object.entries(ESTADOS_CONDUCE).map(([value, info]) => (
                  <option key={value} value={value}>{info.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Porciones</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input text-right"
                {...register('porciones')}
              />
            </div>
          </div>

          <div>
            <label className="label">Escuela *</label>
            <select className="input" {...register('escuelaId', { required: true })}>
              <option value="">Seleccione...</option>
              {escuelas.map((e) => (
                <option key={e.escuelaId} value={e.escuelaId}>{e.nombre}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label">Menú</label>
              <select className="input" {...register('menuComidaId')}>
                <option value="">Seleccione...</option>
                {menu.map((m) => (
                  <option key={m.menuComidaId} value={m.menuComidaId}>{m.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Postre</label>
              <select className="input" {...register('postreId')}>
                <option value="">Seleccione...</option>
                {postres.map((p) => (
                  <option key={p.postreId} value={p.postreId}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Servicio</label>
              <input className="input" placeholder="Desayuno, almuerzo..." {...register('servicio', { maxLength: 100 })} />
            </div>
          </div>

          <input type="hidden" {...register('usuarioId')} />

          <ConduceDetallesEditor
            detalles={detalles}
            setDetalles={setDetalles}
            recetas={recetas}
            puedeEditar={puedeEditarDetalles}
          />

          <div>
            <label className="label">Observaciones</label>
            <textarea className="input" rows={2} {...register('observaciones', { maxLength: 500 })} />
          </div>

          <details className="rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
            <summary className="text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
              Notas de edición (receta / postre)
            </summary>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="label">Edición de receta</label>
                <textarea className="input" rows={2} {...register('edicionReceta', { maxLength: 500 })} />
              </div>
              <div>
                <label className="label">Edición de postre</label>
                <textarea className="input" rows={2} {...register('edicionPostre', { maxLength: 500 })} />
              </div>
            </div>
          </details>

          {error && <p className="text-sm text-red-500">{error}</p>}

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
