import React from 'react';
import { useGasto } from '../../../hooks/useGastos';
import { fmt } from '../../../utils/format';

export function GastoDetalle({ gastoId, onClose }) {
  const { data: g, isLoading } = useGasto(gastoId);

  if (isLoading) return (
    <div className="modal-overlay">
      <div className="modal-box max-w-lg flex items-center justify-center py-12">
        <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-lg">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Gasto #{g?.gastosId}</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {new Date(g?.fecha).toLocaleDateString('es-DO', { dateStyle: 'full' })}
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[['Usuario', g?.usuario], ['Total', fmt(g?.total)]].map(([l, v]) => (
            <div key={l} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{l}</p>
              <p className="font-semibold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{v}</p>
            </div>
          ))}
        </div>
        
        <div className="space-y-2 mb-5">
          {g?.detalles?.map((d, i) => (
            <div key={i} className="flex justify-between items-center p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{d.descripcion}</span>
              <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt(d.monto)}</span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between border-t pt-4" style={{ borderColor: 'var(--border)' }}>
          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
          <span className="text-xl font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt(g?.total)}</span>
        </div>
        
        <button onClick={onClose} className="btn-secondary w-full mt-5">Cerrar</button>
      </div>
    </div>
  );
}
