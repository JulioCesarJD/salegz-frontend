import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../../store/authStore';
import { useVentasCuadre, useCreateCuadre } from '../../../hooks/useCuadres';
import { localDate } from '../../../utils/date';
import { fmt } from '../../../utils/format';
import { DENOM } from '../../../constants/cuadres';
import { NumInput } from '../../common/NumInput';

export function NuevoCuadreModal({ onClose }) {
  const { user } = useAuthStore();
  const hoy = localDate();

  // Custom hook para la creación.
  const createMutation = useCreateCuadre(() => onClose());

  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      ...Object.fromEntries([
        ...DENOM.map(d => [d.key, '']),
        ['totalCheque', ''], ['totalTarjeta', ''], ['totalTransaccion', ''],
        ['cantidadCheque', ''], ['cantidadTarjeta', ''], ['cantidadTransaccion', ''],
      ]),
      fondoInicial: '',
      horaApertura: '08:00',
      horaCierre: new Date().toTimeString().slice(0, 5),
      notas: '',
    }
  });

  const { data: ventasData } = useVentasCuadre(hoy, hoy, user?.usuarioId);
  const ventasSistema = ventasData?.totalCobrado || 0;

  const vals = watch();
  const efectivo = DENOM.reduce((s, d) => s + (parseFloat(vals[d.key] || 0) * d.val), 0);
  const total = efectivo + parseFloat(vals.totalCheque || 0) + parseFloat(vals.totalTarjeta || 0) + parseFloat(vals.totalTransaccion || 0);
  const diferencia = total - parseFloat(vals.fondoInicial || 0) - ventasSistema;
  const difColor = diferencia === 0 ? '#22c55e' : diferencia > 0 ? '#3b82f6' : '#ef4444';

  const submit = (data) => {
    createMutation.mutate({
      empresaId: 1,
      usuarioId: user?.usuarioId,
      ...Object.fromEntries(DENOM.map(d => [d.key, parseFloat(data[d.key] || 0) * d.val])),
      totalCheque: parseFloat(data.totalCheque || 0),
      totalTarjeta: parseFloat(data.totalTarjeta || 0),
      totalTransaccion: parseFloat(data.totalTransaccion || 0),
      cantidadCheque: parseInt(data.cantidadCheque || 0),
      cantidadTarjeta: parseInt(data.cantidadTarjeta || 0),
      cantidadTransaccion: parseInt(data.cantidadTransaccion || 0),
      fondoInicial: parseFloat(data.fondoInicial || 0),
      horaApertura: data.horaApertura,
      horaCierre: data.horaCierre,
      notas: data.notas,
    });
  };

  const numField = (name, { decimals = true, className = '' } = {}) => ({
    decimals,
    className: `input ${className}`,
    ...register(name),
  });

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Nuevo cuadre de caja
          </h2>
          <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Hora apertura</label>
              <input type="time" className="input" {...register('horaApertura')} />
            </div>
            <div>
              <label className="label">Hora cierre</label>
              <input type="time" className="input" {...register('horaCierre')} />
            </div>
            <div>
              <label className="label">Fondo inicial</label>
              <NumInput {...numField('fondoInicial')} />
            </div>
          </div>

          <div>
            <p className="label mb-3">Conteo de efectivo</p>
            <div className="grid grid-cols-3 gap-3">
              {DENOM.map((d) => (
                <div key={d.key}>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.label}</label>
                    <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      = {fmt(parseFloat(vals[d.key] || 0) * d.val)}
                    </span>
                  </div>
                  <NumInput {...numField(d.key, { className: 'text-right py-1.5 text-sm' })} />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Total efectivo</span>
              <span className="font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt(efectivo)}</span>
            </div>
          </div>

          <div>
            <p className="label mb-3">Otros medios de pago</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Cheques',        cant: 'cantidadCheque',      monto: 'totalCheque'      },
                { label: 'Tarjetas',       cant: 'cantidadTarjeta',     monto: 'totalTarjeta'     },
                { label: 'Transferencias', cant: 'cantidadTransaccion', monto: 'totalTransaccion' },
              ].map((m) => (
                <div key={m.label} className="p-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>{m.label}</p>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Cantidad</label>
                      <NumInput {...numField(m.cant, { decimals: false, className: 'py-1.5 text-sm' })} />
                    </div>
                    <div>
                      <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Monto</label>
                      <NumInput {...numField(m.monto, { className: 'py-1.5 text-sm text-right' })} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
              Verificación vs sistema
            </p>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Total contado</span>
              <span className="font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Ventas sistema (cobrado hoy)</span>
              <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>{fmt(ventasSistema)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Menos fondo inicial</span>
              <span className="tabular-nums text-red-500">– {fmt(parseFloat(vals.fondoInicial || 0))}</span>
            </div>
            <div
              className="flex justify-between items-center p-3 rounded-lg mt-1"
              style={{ backgroundColor: diferencia === 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)' }}
            >
              <span className="font-bold text-sm" style={{ color: difColor }}>
                {diferencia === 0 ? 'Cuadre exacto ✓' : diferencia > 0 ? 'Sobrante' : 'Faltante'}
              </span>
              <span className="text-2xl font-extrabold tabular-nums" style={{ color: difColor }}>
                {diferencia === 0 ? fmt(0) : `${diferencia > 0 ? '+' : ''}${fmt(Math.abs(diferencia))}`}
              </span>
            </div>
          </div>

          <div>
            <label className="label">Notas (opcional)</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Ej: Sin incidencias. Un billete falso de RD$1,000 retenido..."
              {...register('notas')}
            />
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
