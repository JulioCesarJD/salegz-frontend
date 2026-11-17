import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MenuSemanalDetallesEditor } from './MenuSemanalDetallesEditor';
import { DIAS_SEMANA } from '../../../models/menuSemanal';

const toRow = (d) => ({
  recetaId: d.recetaId ?? '',
  porciones: d.porciones ?? 1,
  orden: d.orden ?? '',
  observaciones: d.observaciones ?? '',
});

const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');

export function MenuSemanalModal({ menu, recetas = [], puedeEditarDetalles = true, onClose, busy, onSave }) {
  const { register, handleSubmit } = useForm({
    defaultValues: menu
      ? {
          servicio: menu.servicio ?? '',
          semana: menu.semana ?? '',
          diaSemana: String(menu.diaSemana ?? 1),
          fecha: toDateInput(menu.fecha),
          estado: menu.estado ?? true,
        }
      : { servicio: '', semana: '', diaSemana: '1', fecha: '', estado: true },
  });

  const [detalles, setDetalles] = useState(() => (menu?.detalles ?? []).map(toRow));
  const [error, setError] = useState('');

  const submit = (d) => {
    if (!(Number(d.semana) > 0)) {
      setError('La semana debe ser un número mayor que cero.');
      return;
    }
    const filas = detalles.filter((x) => x.recetaId !== '' && x.recetaId !== null);
    if (filas.some((x) => !(Number(x.porciones) > 0))) {
      setError('Cada receta seleccionada debe tener porciones mayores que cero.');
      return;
    }
    setError('');
    onSave({
      servicio: d.servicio || null,
      semana: Number(d.semana),
      diaSemana: Number(d.diaSemana),
      fecha: d.fecha || null,
      estado: Boolean(d.estado),
      detalles: filas.map((x) => ({
        recetaId: Number(x.recetaId),
        porciones: Number(x.porciones),
        orden: x.orden === '' ? null : Number(x.orden),
        observaciones: x.observaciones || null,
      })),
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {menu?.menuSemanalId ? 'Editar menú semanal' : 'Nuevo menú semanal'}
          </h2>
          <button type="button" onClick={onClose} className="btn-ghost btn-icon">×</button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="label">Semana *</label>
              <input
                type="number"
                min="1"
                className="input text-right"
                {...register('semana', { required: true, min: 1 })}
              />
            </div>
            <div>
              <label className="label">Día *</label>
              <select className="input" {...register('diaSemana', { required: true })}>
                {DIAS_SEMANA.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Fecha</label>
              <input type="date" className="input" {...register('fecha')} />
            </div>
            <div>
              <label className="label">Estado</label>
              <label className="flex items-center gap-2 h-[38px] px-3 rounded-lg border cursor-pointer" style={{ borderColor: 'var(--border)' }}>
                <input type="checkbox" {...register('estado')} />
                <span className="text-sm">Activo</span>
              </label>
            </div>
          </div>

          <div>
            <label className="label">Servicio</label>
            <input className="input" placeholder="Desayuno, almuerzo, merienda..." {...register('servicio', { maxLength: 100 })} />
          </div>

          <MenuSemanalDetallesEditor
            detalles={detalles}
            setDetalles={setDetalles}
            recetas={recetas}
            puedeEditar={puedeEditarDetalles}
          />

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
