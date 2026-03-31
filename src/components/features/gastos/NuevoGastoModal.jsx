import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Search, Tag, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../store/authStore';
import { useSearchConsumos, useConsumosGastos, useCreateGasto } from '../../../hooks/useGastos';
import { fmt } from '../../../utils/format';
import { NumInput } from '../../common/NumInput';

export function NuevoGastoModal({ onClose }) {
  const { user } = useAuthStore();
  const [consumoSearch, setConsumoSearch] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);
  
  const createMutation = useCreateGasto(() => onClose());

  const { handleSubmit, watch, control, register, formState: { isDirty } } = useForm({
    defaultValues: { detalles: [] }
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'detalles' });

  const { data: consumosQuery = [] } = useSearchConsumos(consumoSearch);
  const { data: todosConsumos = [] } = useConsumosGastos();

  const resultadosFiltrados = consumosQuery.length > 0
    ? consumosQuery
    : consumoSearch.length >= 1
      ? todosConsumos.filter(c => c.descripcion.toLowerCase().includes(consumoSearch.toLowerCase()))
      : [];

  const detalles = watch('detalles');
  const total = detalles.reduce((s, d) => s + parseFloat(d.monto || 0), 0);

  const agregarConsumo = (c) => {
    if (fields.some(f => f.consumosGastosId === c.consumosGastosId)) {
      toast.error('Ya agregaste ese concepto');
      return;
    }
    append({ consumosGastosId: c.consumosGastosId, descripcion: c.descripcion, monto: '' });
    setConsumoSearch('');
  };

  const closeWithConfirm = () => {
    if (isDirty || detalles?.length > 0) setConfirmCancel(true);
    else onClose();
  };

  const submit = (data) => {
    if (fields.length === 0) { toast.error('Agrega al menos un concepto'); return; }
    createMutation.mutate({
      usuarioId: user?.usuarioId,
      detalles: data.detalles.map(d => ({
        consumosGastosId: d.consumosGastosId,
        monto: parseFloat(d.monto || 0),
      })),
    });
  };

  return (
    <>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeWithConfirm()}>
        <div className="modal-box max-w-2xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Nuevo gasto</h2>
            <button onClick={closeWithConfirm} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
          </div>

          <form onSubmit={handleSubmit(submit)} className="space-y-5">
            <div>
              <label className="label">Agregar concepto</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input className="input pl-8" placeholder="Buscar concepto de gasto..."
                       value={consumoSearch} onChange={e => setConsumoSearch(e.target.value)} />
                       
                {resultadosFiltrados.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 rounded-lg border shadow-lg overflow-hidden"
                       style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    {resultadosFiltrados.map(c => (
                      <button key={c.consumosGastosId} type="button"
                              className="w-full text-left px-3 py-2.5 text-sm hover:bg-[var(--bg-tertiary)] flex items-center gap-2"
                              onClick={() => agregarConsumo(c)}>
                        <Tag size={12} style={{ color: 'var(--text-muted)' }} />
                        {c.descripcion}
                      </button>
                    ))}
                  </div>
                )}
                {consumoSearch.length >= 1 && resultadosFiltrados.length === 0 && (
                  <div className="absolute z-20 w-full mt-1 rounded-lg border shadow-lg overflow-hidden"
                       style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <p className="px-3 py-2.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                      No encontrado. Ve a "Conceptos" para crear uno nuevo.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {fields.length > 0 ? (
              <div className="space-y-2">
                {fields.map((f, i) => (
                  <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg border"
                       style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-tertiary)' }}>
                    <Tag size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <span className="flex-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{f.descripcion}</span>
                    <NumInput className="input w-36 text-right py-1.5 text-sm font-bold"
                              placeholder="0.00"
                              {...register(`detalles.${i}.monto`)} />
                    <button type="button" onClick={() => remove(i)}
                            className="btn-ghost btn-icon btn-sm text-red-400 hover:text-red-600 flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed gap-2"
                   style={{ borderColor: 'var(--border)' }}>
                <Tag size={20} style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Busca y agrega conceptos de gasto</p>
              </div>
            )}

            {fields.length > 0 && (
              <div className="flex justify-end">
                <div className="flex justify-between w-64 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
                  <span className="text-2xl font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt(total)}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={closeWithConfirm} className="btn-secondary flex-1">Cancelar</button>
              <button type="submit" disabled={createMutation.isPending || fields.length === 0} className="btn-primary flex-1">
                {createMutation.isPending ? 'Guardando...' : 'Registrar gasto'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {confirmCancel && (
        <div className="modal-overlay">
          <div className="modal-box max-w-sm">
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>¿Descartar gasto?</h3>
            <p className="text-sm mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>Se perderán todos los cambios.</p>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setConfirmCancel(false)}>No, continuar</button>
              <button className="btn-danger flex-1" onClick={onClose}>Sí, descartar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
