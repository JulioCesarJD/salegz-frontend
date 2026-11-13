import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCreateGasto } from '../../../hooks/useGastos';
import { fmt } from '../../../utils/format';
import { NumInput } from '../../common/NumInput';

export function NuevoGastoModal({ onClose }) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const createMutation = useCreateGasto(() => onClose());

  const { handleSubmit, watch, control, register, formState: { isDirty } } = useForm({
    defaultValues: { descripcion: '', detalles: [] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'detalles' });

  const detalles = watch('detalles') || [];
  const total = detalles.reduce((s, d) => s + parseFloat(d.subTotal || 0) + parseFloat(d.itbis || 0), 0);

  const agregarDetalle = () => append({ subTotal: '', itbis: '', comprobante: '' });

  const closeWithConfirm = () => {
    if (isDirty || detalles?.length > 0) setConfirmCancel(true);
    else onClose();
  };

  const submit = (data) => {
    if (fields.length === 0) { toast.error('Agrega al menos un detalle'); return; }
    if (!data.descripcion?.trim()) { toast.error('La descripción es obligatoria'); return; }
    createMutation.mutate({
      descripcion: data.descripcion.trim(),
      detalles: data.detalles.map(d => ({
        subTotal: parseFloat(d.subTotal || 0),
        itbis: parseFloat(d.itbis || 0),
        comprobante: d.comprobante?.trim() || null,
      })),
    });
  };

  return (
    <>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeWithConfirm()}>
        <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Nuevo gasto</h2>
            <button onClick={closeWithConfirm} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
          </div>

          <form onSubmit={handleSubmit(submit)} className="space-y-5">
            <div>
              <label className="label">Descripción *</label>
              <input className="input" placeholder="Ej: Compra de materiales, pago de servicios..."
                {...register('descripcion', { required: true })} />
            </div>

            <div>
              <label className="label">Detalles</label>
              {fields.length > 0 ? (
                <div className="space-y-2">
                  {fields.map((f, i) => (
                    <div key={f.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end p-3 rounded-lg border"
                      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-tertiary)' }}>
                      <div>
                        <label className="label">Subtotal</label>
                        <NumInput className="input text-right py-1.5 text-sm font-bold" placeholder="0.00"
                          {...register(`detalles.${i}.subTotal`)} />
                      </div>
                      <div>
                        <label className="label">ITBIS</label>
                        <NumInput className="input text-right py-1.5 text-sm font-bold" placeholder="0.00"
                          {...register(`detalles.${i}.itbis`)} />
                      </div>
                      <div>
                        <label className="label">Comprobante</label>
                        <input className="input py-1.5 text-sm" placeholder="NCF..."
                          {...register(`detalles.${i}.comprobante`)} />
                      </div>
                      <button type="button" onClick={() => remove(i)}
                        className="btn-ghost btn-icon btn-sm text-red-400 hover:text-red-600 flex-shrink-0 mb-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed gap-2"
                  style={{ borderColor: 'var(--border)' }}>
                  <Tag size={20} style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Agregue detalles del gasto</p>
                </div>
              )}
              <button type="button" onClick={agregarDetalle} className="btn-secondary w-full mt-3">
                + Agregar detalle
              </button>
            </div>

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
