import React, { useState } from 'react';
import { Tag, Plus, Pencil, Check, X } from 'lucide-react';
import { useConsumosGastos, useCreateConsumo, useActualizarConsumo } from '../../../hooks/useGastos';

export function ConceptosModal({ onClose }) {
  const [nuevo, setNuevo]       = useState('');
  const [editando, setEditando] = useState(null); // { id, texto }

  const { data: conceptos = [], isLoading } = useConsumosGastos();
  const crearMutation     = useCreateConsumo(() => setNuevo(''));
  const actualizarMutation = useActualizarConsumo(() => setEditando(null));

  const handleCrear = () => {
    if (!nuevo.trim()) return;
    crearMutation.mutate({ descripcion: nuevo.trim() });
  };

  const handleGuardarEdicion = (consumosGastosId) => {
    if (!editando?.texto.trim()) return;
    actualizarMutation.mutate({
      consumosGastosId,
      data: { descripcion: editando.texto.trim() },
    });
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-md">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Conceptos de gasto</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Administra los conceptos disponibles</p>
          </div>
          <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
        </div>

        <div className="flex gap-2 mb-5">
          <input
            className="input flex-1"
            placeholder="Ej: Agua, Luz, Teléfono, Gasolina..."
            value={nuevo}
            onChange={e => setNuevo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCrear()}
          />
          <button onClick={handleCrear} disabled={crearMutation.isPending || !nuevo.trim()} className="btn-primary px-4">
            <Plus size={15} />
          </button>
        </div>

        {isLoading ? (
          <p className="text-center py-6 text-sm" style={{ color: 'var(--text-muted)' }}>Cargando...</p>
        ) : conceptos.length === 0 ? (
          <div className="text-center py-8">
            <Tag size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No hay conceptos. Crea el primero arriba.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {conceptos.map(c => (
              <div key={c.consumosGastosId} className="flex items-center gap-2 p-3 rounded-lg"
                   style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                     style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <Tag size={12} style={{ color: 'var(--text-muted)' }} />
                </div>

                {editando?.id === c.consumosGastosId ? (
                  <>
                    <input
                      className="input flex-1 py-1 text-sm"
                      value={editando.texto}
                      onChange={e => setEditando(prev => ({ ...prev, texto: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleGuardarEdicion(c.consumosGastosId)}
                      autoFocus
                    />
                    <button onClick={() => handleGuardarEdicion(c.consumosGastosId)}
                            disabled={actualizarMutation.isPending}
                            className="btn-ghost btn-icon btn-sm text-green-500">
                      <Check size={14} />
                    </button>
                    <button onClick={() => setEditando(null)} className="btn-ghost btn-icon btn-sm text-red-400">
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {c.descripcion}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>#{c.consumosGastosId}</span>
                    <button onClick={() => setEditando({ id: c.consumosGastosId, texto: c.descripcion })}
                            className="btn-ghost btn-icon btn-sm">
                      <Pencil size={13} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <button onClick={onClose} className="btn-secondary w-full mt-5">Cerrar</button>
      </div>
    </div>
  );
}