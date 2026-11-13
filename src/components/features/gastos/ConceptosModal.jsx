import React from 'react';
import { Tag } from 'lucide-react';

export function ConceptosModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-md">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Conceptos de gasto</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No hay catálogo de conceptos en la API</p>
          </div>
          <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
        </div>
        <div className="text-center py-8">
          <Tag size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Los conceptos se describen directamente en el campo Descripción del gasto
            y en el comprobante de cada detalle.
          </p>
        </div>
        <button onClick={onClose} className="btn-secondary w-full mt-2">Cerrar</button>
      </div>
    </div>
  );
}
