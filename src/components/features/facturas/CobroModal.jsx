import React, { useState } from 'react';
 
import { Banknote, CreditCard, ArrowRight, Receipt} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useSaldarFactura } from '../../../hooks/useFacturas';
import { fmt } from '../../../utils/format';
import { NumInput } from '../../common/NumInput';

export function CobroModal({ factura, onClose }) {
  const [monto, setMonto] = useState(factura.total); // Manejamos esto aún como numérico localmente, NumInput lo recibe y lo parseamos
  const [tipoPago, setTipoPago] = useState(factura.tipoPago || 'Efectivo');
  const { user } = useAuthStore();
  
  const saldarMutation = useSaldarFactura(() => onClose());

  const cambio = monto - factura.total;
  const pendiente = factura.total - monto;
  const esPagado = monto >= factura.total;

  const handleCobrar = () => {
    saldarMutation.mutate({
      facturaId: factura.facturaId,
      usuarioId: user?.usuarioId,
      monto: Math.min(parseFloat(monto || 0), factura.total),
    });
  };

  const handleDejarPendiente = () => onClose();

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && handleDejarPendiente()}>
      <div className="modal-box max-w-md">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
            <Banknote size={26} className="text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            Cobrar factura #{factura.facturaId}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Cliente: <strong>{factura.nombreCliente}</strong>
          </p>
        </div>

        {/* Total a cobrar */}
        <div className="rounded-xl p-4 mb-5 text-center"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
            Total de la factura
          </p>
          <p className="text-4xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            {fmt(factura.total)}
          </p>
        </div>

        {/* Tipo de pago */}
        <div className="mb-4">
          <label className="label">Tipo de pago</label>
          <div className="grid grid-cols-3 gap-2">
            {['Efectivo', 'Tarjeta', 'Transferencia', 'Cheque'].map(t => (
              <button key={t} type="button"
                onClick={() => setTipoPago(t)}
                className={`py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                  tipoPago === t
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'hover:bg-[var(--bg-tertiary)]'
                }`}
                style={{
                  backgroundColor: tipoPago === t ? 'var(--brand-light)' : 'var(--bg-card)',
                  borderColor: tipoPago === t ? 'var(--brand)' : 'var(--border)',
                  color: tipoPago === t ? 'var(--brand)' : 'var(--text-secondary)',
                }}>
                {t === 'Efectivo' && <Banknote size={14} className="mx-auto mb-1" />}
                {t === 'Tarjeta'  && <CreditCard size={14} className="mx-auto mb-1" />}
                {t === 'Transferencia' && <ArrowRight size={14} className="mx-auto mb-1" />}
                {t === 'Cheque' && <Receipt size={14} className="mx-auto mb-1" />}
                {t}
              </button>
            ))}
          </div>
           
        </div>

        {/* Monto recibido (Corregido a NumInput) */}
        <div className="mb-4">
          <label className="label">
            {tipoPago === 'Crédito' ? 'Monto de abono (0 = todo en crédito)' : 'Monto recibido'}
          </label>
          <NumInput
            className="input text-right text-2xl font-extrabold py-3"
            value={monto}
            onChange={e => setMonto(e.target.value)}
            style={{ color: 'var(--text-primary)' }}
            placeholder="0"
          />
          <div className="flex gap-2 mt-2">
            {[factura.total, Math.ceil(factura.total / 100) * 100, Math.ceil(factura.total / 500) * 500, Math.ceil(factura.total / 1000) * 1000]
              .filter((v, i, arr) => arr.indexOf(v) === i)
              .slice(0, 4)
              .map(v => (
                <button key={v} type="button"
                  onClick={() => setMonto(v)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:bg-[var(--bg-tertiary)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  {fmt(v)}
                </button>
              ))
            }
          </div>
        </div>

        {/* Cambio / Pendiente */}
        {parseFloat(monto || 0) > 0 && (
          <div className={`rounded-xl p-4 mb-5 flex justify-between items-center ${
            esPagado ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'
          }`}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: esPagado ? '#16a34a' : '#d97706' }}>
                {esPagado ? (cambio > 0 ? 'Cambio a devolver' : 'Pago exacto ✓') : 'Queda pendiente'}
              </p>
              {esPagado && cambio > 0 && (
                <p className="text-2xl font-extrabold text-green-600">{fmt(cambio)}</p>
              )}
              {!esPagado && (
                <p className="text-2xl font-extrabold text-yellow-600">{fmt(pendiente)}</p>
              )}
            </div>
            {esPagado && cambio === 0 && (
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-lg">✓</span>
              </div>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="space-y-2">
          <button
            onClick={handleCobrar}
            disabled={saldarMutation.isPending || (tipoPago !== 'Crédito' && parseFloat(monto || 0) <= 0)}
            className="btn-primary w-full py-3 text-base"
          >
            {saldarMutation.isPending ? 'Procesando...' : tipoPago === 'Crédito' && parseFloat(monto || 0) === 0 ? 'Dejar en crédito' : `Cobrar ${fmt(Math.min(parseFloat(monto || 0), factura.total))}`}
          </button>
          <button onClick={handleDejarPendiente} className="btn-ghost w-full py-2 text-sm">
            Dejar pendiente y cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
