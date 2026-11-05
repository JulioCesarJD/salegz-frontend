import React from 'react';
import { useForm } from 'react-hook-form';
import { Banknote, CreditCard, ArrowRight, Receipt, Calendar } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useVentasCuadre, useCreateCuadre } from '../../../hooks/useCuadres';
import { isSuperAdmin } from '../../../utils/auth';
import { localDate } from '../../../utils/date';
import { fmt } from '../../../utils/format';

export function NuevoCuadreModal({ onClose }) {
  const { user } = useAuthStore();
  const hoy = localDate();

  // Custom hook para la creación.
  const createMutation = useCreateCuadre(() => onClose());

  const { register, handleSubmit, watch } = useForm({
    defaultValues: { fecha: hoy },
  });

  const fecha = watch('fecha') || hoy;

  const { data: ventasData = [] } = useVentasCuadre(fecha, fecha);
  const ventasSistema = (ventasData || []).reduce(
    (s, v) => s + (Number(v.total) || 0),
    0
  );

  const submit = (data) => {
    createMutation.mutate({
      usuarioId: isSuperAdmin(user) ? null : (user?.usuarioId ?? null),
      fecha: data.fecha || hoy,
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Nuevo cuadre de caja
          </h2>
          <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          <div>
            <label className="label">Fecha del cuadre</label>
            <input type="date" className="input" {...register('fecha', { required: true })} />
          </div>

          <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 flex-shrink-0">
                <Calendar size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Cálculo automático
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Los totales de efectivo, cheques, tarjetas, transferencias y cancelaciones
                  se calculan desde las facturas y abonos registrados en la fecha.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
              Vista previa de ventas del día
            </p>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Ventas registradas</span>
              <span className="font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt(ventasSistema)}</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              El total del cuadre se calculará al guardar, incluyendo los abonos del día.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              ['Efectivo', Banknote, 'text-green-600'],
              ['Cheque', Receipt, 'text-orange-500'],
              ['Tarjeta', CreditCard, 'text-blue-500'],
              ['Transfer.', ArrowRight, 'text-purple-500'],
            ].map(([label, Icon, color]) => (
              <div key={label} className="p-3 rounded-lg text-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <Icon size={16} className={`mx-auto mb-1 ${color}`} />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1">
              {createMutation.isPending ? 'Guardando...' : 'Guardar cuadre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
