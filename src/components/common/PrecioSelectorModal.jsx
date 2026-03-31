import React from 'react';
import { fmt } from '../../utils/format';

export function PrecioSelectorModal({ producto, onSelect, onClose }) {
  const precios = [
    { label: 'Precio 1', value: producto.precio1 },
    { label: 'Precio 2', value: producto.precio2 },
    { label: 'Precio 3', value: producto.precio3 },
  ].filter(p => p.value > 0);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-xs">
        <h2 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Seleccionar precio</h2>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{producto.descripcion}</p>
        <div className="space-y-2">
          {precios.map(p => (
            <button key={p.label} type="button" onClick={() => onSelect(p.value)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors hover:bg-[var(--bg-tertiary)] active:scale-95"
              style={{ borderColor: 'var(--border)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{p.label}</span>
              <span className="text-base font-extrabold" style={{ color: 'var(--brand)' }}>{fmt(p.value)}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={onClose} className="btn-secondary w-full mt-4 btn-sm">Cancelar</button>
      </div>
    </div>
  );
}
