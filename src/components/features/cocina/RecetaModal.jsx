import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { RecetaIngredientesEditor } from './RecetaIngredientesEditor';

const toRow = (i) => ({
  productoId: i.productoId ?? '',
  cantidad: i.cantidad ?? 1,
  unidadMedida: i.unidadMedida ?? '',
});

export function RecetaModal({ receta, productos = [], puedeEditarIngredientes = true, onClose, busy, onSave }) {
  const { register, handleSubmit } = useForm({
    defaultValues: receta
      ? {
          codigo: receta.codigo ?? '',
          nombre: receta.nombre ?? '',
          descripcion: receta.descripcion ?? '',
          porcionesBase: receta.porcionesBase ?? 1,
          precioVenta: receta.precioVenta ?? 0,
          costo: receta.costo ?? 0,
          estado: receta.estado ?? true,
        }
      : {
          codigo: '',
          nombre: '',
          descripcion: '',
          porcionesBase: 1,
          precioVenta: '',
          costo: '',
          estado: true,
        },
  });

  const [ingredientes, setIngredientes] = useState(() =>
    (receta?.ingredientes ?? []).map(toRow)
  );
  const [error, setError] = useState('');

  const submit = (d) => {
    const filas = ingredientes.filter((i) => i.productoId !== '' && i.productoId !== null);
    if (filas.some((i) => !(Number(i.cantidad) > 0))) {
      setError('Cada ingrediente seleccionado debe tener una cantidad mayor que cero.');
      return;
    }
    setError('');
    onSave({
      codigo: d.codigo || null,
      nombre: d.nombre,
      descripcion: d.descripcion || null,
      porcionesBase: Number(d.porcionesBase) || 0,
      precioVenta: Number(d.precioVenta) || 0,
      costo: Number(d.costo) || 0,
      estado: Boolean(d.estado),
      ingredientes: filas.map((i) => ({
        productoId: Number(i.productoId),
        cantidad: Number(i.cantidad),
        unidadMedida: i.unidadMedida || null,
      })),
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {receta?.recetaId ? 'Editar receta' : 'Nueva receta'}
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
              <label className="label">Nombre *</label>
              <input
                className="input"
                placeholder="Nombre de la receta"
                {...register('nombre', { required: true, maxLength: 200 })}
              />
            </div>
          </div>

          <div>
            <label className="label">Descripción</label>
            <textarea className="input" rows={2} {...register('descripcion', { maxLength: 500 })} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="label">Porciones base</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input text-right"
                {...register('porcionesBase', { min: 0 })}
              />
            </div>
            <div>
              <label className="label">Precio venta</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input text-right"
                placeholder="0.00"
                {...register('precioVenta', { min: 0 })}
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
                <span className="text-sm">Activa</span>
              </label>
            </div>
          </div>

          <RecetaIngredientesEditor
            ingredientes={ingredientes}
            setIngredientes={setIngredientes}
            productos={productos}
            puedeEditar={puedeEditarIngredientes}
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
