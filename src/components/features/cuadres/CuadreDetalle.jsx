import React from 'react';
import { useCuadre } from '../../../hooks/useCuadres';
import { fmt } from '../../../utils/format';
import { printCuadre } from '../../../utils/print/printCuadre';
import { Printer } from 'lucide-react';
import * as commonService from '../../../services/commonService';
import * as cuadresService from '../../../services/cuadresService';

const fechaLarga = (fecha) => {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-DO', { dateStyle: 'full' });
};

export function CuadreDetalle({ cuadreId, onClose }) {
  const { data: c, isLoading } = useCuadre(cuadreId);

  const handleImprimir = async (id) => {
    try {
      const [cuadre, empresa, control] = await Promise.all([
        cuadresService.getCuadreById(id),
        commonService.getEmpresa(),
        commonService.getControlesEmpresa(),
      ]);
      printCuadre(cuadre, empresa, control);
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) return (
    <div className="modal-overlay">
      <div className="modal-box max-w-lg flex items-center justify-center py-12">
        <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-lg overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Cuadre #{c?.cuadreId}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {fechaLarga(c?.fecha)}
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Cajero</p>
            <p className="font-semibold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{c?.usuarioNombre || '—'}</p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Ventas del sistema</p>
            <p className="font-semibold text-sm mt-0.5 tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt(c?.ventasSistema)}</p>
          </div>
        </div>

        <div className="space-y-2 border-t pt-4 mb-4" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
            Resumen de cobros
          </p>
          {[
            ['Efectivo', fmt(c?.totalEfectivo)],
            [`Cheques (${c?.cantidadCheque || 0})`, fmt(c?.totalCheque)],
            [`Tarjetas (${c?.cantidadTarjeta || 0})`, fmt(c?.totalTarjeta)],
            [`Transferencias (${c?.cantidadTransaccion || 0})`, fmt(c?.totalTransaccion)],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-muted)' }}>{l}</span>
              <span className="font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>{v}</span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-2" style={{ borderColor: 'var(--border)' }}>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Total cobrado</span>
            <span className="text-xl font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt(c?.total)}</span>
          </div>
        </div>

        <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
            Movimientos del día
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Facturas canceladas ({c?.cantidadCancelado || 0})</span>
              <span className="tabular-nums font-medium text-red-500">{fmt(c?.montoCancelado)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Notas de crédito ({c?.cantidadNotaCredito || 0})</span>
              <span className="tabular-nums font-medium">{fmt(c?.montoNotaCredito)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1">Cerrar</button>
          <button onClick={() => handleImprimir(c?.cuadreId)} className="btn-primary flex-1">
            <Printer size={15} /> Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
