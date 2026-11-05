import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { NumInput } from '../../common/NumInput';
import { useCreateProducto, useUpdateProducto } from '../../../hooks/useProductos';

export function ProductoModal({ prod, cats, onClose }) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const isEdit = !!prod?.productoId;

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    defaultValues: prod || {
      itbis: 0,
      cantidad: '', minimo: '', precio2: '', precio3: '', costo: '', precio1: '',
    },
  });

  const createMutation = useCreateProducto(() => onClose());
  const updateMutation = useUpdateProducto(() => onClose());

  const busy = createMutation.isPending || updateMutation.isPending;

  const closeWithConfirm = () => {
    if (!isDirty && !isEdit) { onClose(); return; }
    setConfirmCancel(true);
  };

  const submit = (d) => {
    const itbis = parseFloat(d.itbis) || 0
    const payload = {
      ...d,
      categoriaId: parseInt(d.categoriaId),
      cantidad:    parseFloat(d.cantidad  || 0),
      costo:       parseFloat(d.costo     || 0),
      minimo:      parseInt(d.minimo      || 0),
      precio1:     parseFloat(d.precio1   || 0),
      precio2:     parseFloat(d.precio2   || 0),
      precio3:     parseFloat(d.precio3   || 0),
      itbis,
      exento:      itbis <= 0,
    };

    if (isEdit) {
      updateMutation.mutate({ ...payload, productoId: prod.productoId });
    } else {
      createMutation.mutate(payload);
    }
  };

  const numField = (name, opts = {}) => {
    const { decimals = true, required, className = 'input' } = opts;
    return { decimals, className, ...register(name, required ? { required: 'Requerido' } : {}) };
  };

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
              <option value={18}>Gravado (18%)</option>
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
              <button className="btn-primary" onClick={() => { setConfirmCancel(false); onClose(); }}>Sí, cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
