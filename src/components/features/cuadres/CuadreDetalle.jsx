import React from 'react';
import { useCuadre } from '../../../hooks/useCuadres';
import { ESTADO_CUADRE, DENOM } from '../../../constants/cuadres';
import { fmt } from '../../../utils/format'; 
import { printCuadre } from '../../../utils/print/printCuadre';
import { Printer } from 'lucide-react';
import * as commonService from '../../../services/commonService';  // <-- Añadir
import * as cuadresService from '../../../services/cuadresService';


export function CuadreDetalle({ cuadreId, onClose,onImprimir }) {
  const { data: c, isLoading } = useCuadre(cuadreId);

  const handleImprimir = async (cuadreId) => {
    try {
      const [cuadre, empresa, control] = await Promise.all([
        cuadresService.getCuadreById(cuadreId),
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

  const efectivo = DENOM.reduce((s, d) => s + (c?.[d.key] || 0), 0);
  const diferencia = c?.diferencia || 0;
  const difColor = diferencia === 0 ? '#22c55e' : diferencia > 0 ? '#3b82f6' : '#ef4444';
  const difLabel = diferencia === 0 ? 'Cuadre exacto ✓' : diferencia > 0 ? 'Sobrante' : 'Faltante';

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Cuadre #{c?.cuadreId}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {new Date(c?.fecha).toLocaleDateString('es-DO', { dateStyle: 'full' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {ESTADO_CUADRE[c?.estadoCuadre ?? 0]}
            <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Cajero</p>
            <p className="font-semibold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{c?.usuario}</p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Turno</p>
            <p className="font-semibold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {c?.horaApertura || '—'} – {c?.horaCierre || '—'}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center p-3 rounded-lg mb-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Fondo inicial</span>
          <span className="font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt(c?.fondoInicial)}</span>
        </div>

        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
          Conteo de efectivo
        </p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {DENOM.filter((d) => (c?.[d.key] || 0) > 0).map((d) => (
            <div key={d.key} className="p-3 rounded-lg text-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{d.label}</p>
              <p className="font-bold text-sm tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt(c?.[d.key])}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t pt-4 mb-4" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
            Resumen de cobros
          </p>
          {[
            ['Efectivo contado', fmt(efectivo)],
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
            Verificación vs sistema
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Ventas registradas</span>
              <span className="tabular-nums font-medium">{fmt(c?.ventasSistema)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Menos fondo inicial</span>
              <span className="tabular-nums font-medium text-red-500">– {fmt(c?.fondoInicial)}</span>
            </div>
            <div
              className="flex justify-between items-center p-2 rounded-lg mt-1"
              style={{ backgroundColor: diferencia === 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}
            >
              <span className="text-sm font-bold" style={{ color: difColor }}>{difLabel}</span>
              <span className="text-lg font-extrabold tabular-nums" style={{ color: difColor }}>
                {diferencia === 0 ? fmt(0) : `${diferencia > 0 ? '+' : ''}${fmt(Math.abs(diferencia))}`}
              </span>
            </div>
          </div>
        </div>

        {c?.notas && (
          <div className="p-3 rounded-lg mb-4" style={{ border: '1px solid var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Notas</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{c.notas}</p>
          </div>
        )}

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
