import React, { useState, useEffect } from 'react';
import { Search, Trash2, Tag } from 'lucide-react';
import { useSearchConsumos, useConsumosGastos, useActualizarGasto } from '../../../hooks/useGastos';
import { NumInput } from '../../common/NumInput';
import { fmt } from '../../../utils/format';

export function EditarGastoModal({ gasto, onClose, onSaveSuccess }) {
  const [detalles, setDetalles]   = useState([]);
  const [busqueda, setBusqueda]   = useState('');

  const { data: consumosQuery = [] } = useSearchConsumos(busqueda);
  const { data: todosConsumos = [] } = useConsumosGastos();
  const actualizarMutation = useActualizarGasto(() => { onSaveSuccess?.(); onClose(); });

  const resultados = consumosQuery.length > 0
    ? consumosQuery
    : busqueda.length >= 1
      ? todosConsumos.filter(c => c.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
      : [];

  useEffect(() => {
    if (gasto?.detalles) {
      setDetalles(gasto.detalles.map(d => ({
        consumosGastosId: d.consumosGastosId,
        descripcion:      d.descripcion,
        monto:            d.monto,
      })));
    }
  }, [gasto]);

  const agregarConsumo = (c) => {
    if (detalles.some(d => d.consumosGastosId === c.consumosGastosId)) return;
    setDetalles(prev => [...prev, { consumosGastosId: c.consumosGastosId, descripcion: c.descripcion, monto: '' }]);
    setBusqueda('');
  };

  const cambiarMonto = (idx, val) => {
    setDetalles(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], monto: val };
      return copy;
    });
  };

  const eliminar = (idx) => setDetalles(prev => prev.filter((_, i) => i !== idx));

  const total = detalles.reduce((s, d) => s + parseFloat(d.monto || 0), 0);

  const handleGuardar = () => {
    if (detalles.length === 0) return;
    actualizarMutation.mutate({
      gastosId: gasto.gastosId,
      data: {
        detalles: detalles.map(d => ({
          consumosGastosId: d.consumosGastosId,
          monto: parseFloat(d.monto || 0),
        })),
      },
    });
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-lg">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Editar gasto #{gasto.gastosId}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{gasto.usuario}</p>
          </div>
          <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
        </div>

        {/* Buscador */}
        <div className="mb-4">
          <label className="label">Agregar concepto</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input className="input pl-8 w-full" placeholder="Buscar concepto..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            {resultados.length > 0 && (
              <div className="absolute z-20 w-full mt-1 rounded-lg border shadow-lg overflow-hidden"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                {resultados.map(c => (
                  <button key={c.consumosGastosId} type="button"
                    className="w-full text-left px-3 py-2.5 text-sm hover:bg-[var(--bg-tertiary)] flex items-center gap-2"
                    onClick={() => agregarConsumo(c)}>
                    <Tag size={12} style={{ color: 'var(--text-muted)' }} />
                    {c.descripcion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detalles */}
        <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
          {detalles.length === 0 ? (
            <div className="text-center py-8 rounded-xl border-2 border-dashed" style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sin conceptos</p>
            </div>
          ) : detalles.map((d, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-tertiary)' }}>
              <Tag size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <span className="flex-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{d.descripcion}</span>
              <NumInput
                className="input w-32 text-right py-1.5 text-sm font-bold"
                placeholder="0.00"
                value={d.monto}
                onChange={e => cambiarMonto(i, e.target.value)}
              />
              <button onClick={() => eliminar(i)} className="btn-ghost btn-icon btn-sm text-red-400">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* Total */}
        {detalles.length > 0 && (
          <div className="flex justify-between border-t pt-3 mb-5" style={{ borderColor: 'var(--border)' }}>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
            <span className="text-xl font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt(total)}</span>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={handleGuardar}
            disabled={actualizarMutation.isPending || detalles.length === 0}
            className="btn-primary flex-1">
            {actualizarMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}