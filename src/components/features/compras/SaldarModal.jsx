import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../../store/authStore';
import { fmt } from '../../../utils/format';
import { NumInput } from '../../common/NumInput';
import { useSaldarCompra } from '../../../hooks/useCompras';

export function SaldarModal({ compra, onClose }) {
  const { register, handleSubmit } = useForm();
  const { user } = useAuthStore();
  const saldarMutation = useSaldarCompra(() => onClose());

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-sm">
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Registrar pago</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
          Compra #{compra.compraId} · <strong className="text-red-500">{fmt(compra.total)}</strong>
        </p>
        <form onSubmit={handleSubmit(d => saldarMutation.mutate({
          compraId:  compra.compraId,
          usuarioId: user?.usuarioId,
          monto:     parseFloat(d.monto),
        }))} className="space-y-4">
          <div>
            <label className="label">Monto a abonar *</label>
            <NumInput className="input text-right text-lg font-bold"
              placeholder="0.00"
              {...register('monto', { required: true, min: 0.01 })} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={saldarMutation.isPending} className="btn-primary flex-1">
              {saldarMutation.isPending ? 'Guardando...' : 'Registrar pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
