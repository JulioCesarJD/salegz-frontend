import React from 'react';
import { useForm } from 'react-hook-form';
import { useCategorias, useCreateCategoria, useUpdateCategoria } from '../../../hooks/useCategorias';

export function CategoriaModal({ cat, onClose }) {
  const { data: categorias = [] } = useCategorias();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: cat || {},
  });

  const createMutation = useCreateCategoria(() => onClose());
  const updateMutation = useUpdateCategoria(() => onClose());

  const busy = createMutation.isPending || updateMutation.isPending;

  const onSave = (d) => {
    if (cat?.categoriaId) {
      updateMutation.mutate({ ...d, categoriaId: cat.categoriaId });
    } else {
      createMutation.mutate(d);
    }
  };

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
              {...register('descripcion', {
                required: 'Requerido',
                maxLength: 100,
                validate: (value) => {
                  const text = value?.trim().toLowerCase();
                  if (!text) return 'Requerido';
                  const exists = categorias.some((c) => c.descripcion?.trim().toLowerCase() === text && c.categoriaId !== cat?.categoriaId);
                  return !exists || 'Ya existe una categoría con ese nombre';
                },
              })} />
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
  );
}
