import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MenuComidaDetallesEditor } from './MenuComidaDetallesEditor';

const toRow = (d) => ({
  productoId: d.productoId ?? '',
  cantidad: d.cantidad ?? 1,
  unidadMedida: d.unidadMedida ?? '',
  costoUnitario: d.costoUnitario ?? 0,
  observacion: d.observacion ?? '',
});

export function MenuComidaModal({ menu, productos = [], puedeEditarDetalles = true, onClose, busy, onSave }) {
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: menu
      ? {
          nombre: menu.nombre ?? '',
          precio: menu.precio ?? 0,
          costo: menu.costo ?? 0,
          estado: menu.estado ?? true,
        }
      : { nombre: '', precio: '', costo: '', estado: true },
  });

  const [detalles, setDetalles] = useState(() => (menu?.detalles ?? []).map(toRow));
  const [error, setError] = useState('');

  const totalIngredientes = detalles.reduce(
    (acc, d) => acc + (Number(d.cantidad) || 0) * (Number(d.costoUnitario) || 0),
    0
  );

  const submit = (d) => {
    const filas = detalles.filter((x) => x.productoId !== '' && x.productoId !== null);
    if (filas.some((x) => !(Number(x.cantidad) > 0))) {
      setError('Cada ingrediente seleccionado debe tener una cantidad mayor que cero.');
      return;
    }
    setError('');
    onSave({
      nombre: d.nombre,
      precio: Number(d.precio) || 0,
      costo: Number(d.costo) || 0,
      estado: Boolean(d.estado),
      detalles: filas.map((x) => ({
        productoId: Number(x.productoId),
        cantidad: Number(x.cantidad),
        unidadMedida: x.unidadMedida || null,
        costoUnitario: Number(x.costoUnitario) || 0,
        observacion: x.observacion || null,
      })),
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {menu?.menuComidaId ? 'Editar plato' : 'Nuevo plato'}
          </h2>
          <button type="button" onClick={onClose} className="btn-ghost btn-icon">×</button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <label className="label">Nombre *</label>
            <input
              className="input"
              placeholder="Nombre del plato"
              {...register('nombre', { required: true, maxLength: 200 })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label">Precio *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input text-right"
                placeholder="0.00"
                {...register('precio', { required: true, min: 0 })}
              />
            </div>
            <div>
              <label className="label">Costo *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input text-right"
                placeholder="0.00"
                {...register('costo', { required: true, min: 0 })}
              />
              {totalIngredientes > 0 && (
                <button
                  type="button"
                  className="text-xs mt-1 underline"
                  style={{ color: 'var(--brand)' }}
                  onClick={() => setValue('costo', totalIngredientes.toFixed(2))}
                >
                  Usar costo de ingredientes
                </button>
              )}
            </div>
            <div>
              <label className="label">Estado</label>
              <label className="flex items-center gap-2 h-[38px] px-3 rounded-lg border cursor-pointer" style={{ borderColor: 'var(--border)' }}>
                <input type="checkbox" {...register('estado')} />
                <span className="text-sm">Activo</span>
              </label>
            </div>
          </div>

          <MenuComidaDetallesEditor
            detalles={detalles}
            setDetalles={setDetalles}
            productos={productos}
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
