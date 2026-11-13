import React, { useState, useEffect } from 'react';
import { Trash2, Tag } from 'lucide-react';
import { useActualizarGasto } from '../../../hooks/useGastos';
import { NumInput } from '../../common/NumInput';
import { fmt } from '../../../utils/format';

export function EditarGastoModal({ gasto, onClose, onSaveSuccess }) {
  const [descripcion, setDescripcion] = useState(gasto?.descripcion || '');
  const [detalles, setDetalles] = useState([]);

  const actualizarMutation = useActualizarGasto(() => { onSaveSuccess?.(); onClose(); });

  useEffect(() => {
    setDescripcion(gasto?.descripcion || '');
    setDetalles((gasto?.detalles || []).map((d) => ({
      subTotal: d.subTotal ?? '',
      itbis: d.itbis ?? '',
      comprobante: d.comprobante || '',
    })));
  }, [gasto]);

  const cambiar = (idx, field, val) => setDetalles((prev) => {
    const copy = [...prev];
    copy[idx] = { ...copy[idx], [field]: val };
    return copy;
  });

  const eliminar = (idx) => setDetalles((prev) => prev.filter((_, i) => i !== idx));
  const agregar = () => setDetalles((prev) => [...prev, { subTotal: '', itbis: '', comprobante: '' }]);

  const total = detalles.reduce((s, d) => s + parseFloat(d.subTotal || 0) + parseFloat(d.itbis || 0), 0);

  const handleGuardar = () => {
    if (!descripcion.trim()) return;
    if (detalles.length === 0) return;
    actualizarMutation.mutate({
      gastosId: gasto.gastosId,
      data: {
        descripcion: descripcion.trim(),
        detalles: detalles.map((d) => ({
          subTotal: parseFloat(d.subTotal || 0),
          itbis: parseFloat(d.itbis || 0),
          comprobante: d.comprobante?.trim() || null,
        })),
      },
    });
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Editar gasto #{gasto.gastosId}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {gasto.fechaCreacion ? new Date(gasto.fechaCreacion).toLocaleDateString('es-DO') : ''}
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Descripción *</label>
            <input className="input" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>

          <div className="space-y-2">
            {detalles.length === 0 ? (
              <div className="text-center py-8 rounded-xl border-2 border-dashed" style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sin detalles. Agregue uno.</p>
              </div>
            ) : detalles.map((d, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end p-3 rounded-lg border"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-tertiary)' }}>
                <div>
                  <label className="label">Subtotal</label>
                  <NumInput className="input text-right py-1.5 text-sm font-bold" placeholder="0.00"
                    value={d.subTotal} onChange={(e) => cambiar(i, 'subTotal', e.target.value)} />
                </div>
                <div>
                  <label className="label">ITBIS</label>
                  <NumInput className="input text-right py-1.5 text-sm font-bold" placeholder="0.00"
                    value={d.itbis} onChange={(e) => cambiar(i, 'itbis', e.target.value)} />
                </div>
                <div>
                  <label className="label">Comprobante</label>
                  <input className="input py-1.5 text-sm" placeholder="NCF..."
                    value={d.comprobante} onChange={(e) => cambiar(i, 'comprobante', e.target.value)} />
                </div>
                <button onClick={() => eliminar(i)} className="btn-ghost btn-icon btn-sm text-red-400 mb-1">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <button onClick={agregar} className="btn-secondary w-full">
              <Tag size={13} /> Agregar detalle
            </button>
          </div>

          {detalles.length > 0 && (
            <div className="flex justify-between border-t pt-3" style={{ borderColor: 'var(--border)' }}>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
              <span className="text-xl font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt(total)}</span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button onClick={handleGuardar}
              disabled={actualizarMutation.isPending || detalles.length === 0 || !descripcion.trim()}
              className="btn-primary flex-1">
              {actualizarMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
