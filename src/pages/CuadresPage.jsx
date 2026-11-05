import React, { useState } from 'react';
import { Plus, Eye, TrendingUp, Printer } from 'lucide-react';
import { usePermiso } from '../hooks/usePermiso';
import { useCuadres } from '../hooks/useCuadres';
import { fmt } from '../utils/format';
import { NuevoCuadreModal } from '../components/features/cuadres/NuevoCuadreModal';
import { CuadreDetalle } from '../components/features/cuadres/CuadreDetalle';
import * as commonService from '../services/commonService';
import * as cuadresService from '../services/cuadresService';
import { printCuadre } from '../utils/print/printCuadre';

const fechaCorta = (fecha) => {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-DO');
};

export function CuadresPage() {
  const { puedeVer, puedeAcceder } = usePermiso();

  // Verificar acceso a Cuadres
  if (!puedeVer('verCuadres')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold mb-2">
            Acceso Denegado
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            No tienes permisos para acceder a cuadres
          </p>
        </div>
      </div>
    )
  }

  const [modal, setModal] = useState(null);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  // Hook abstracto
  const { data: cuadres = [], isLoading } = useCuadres(desde, hasta);

  const totalEfectivo = cuadres.reduce((s, c) => s + (Number(c.totalEfectivo) || 0), 0);
  const totalTarjeta = cuadres.reduce((s, c) => s + (Number(c.totalTarjeta) || 0), 0);

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

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cuadres de caja</h1>
          <p className="page-sub">{cuadres.length} cuadres registrados</p>
        </div>
        {puedeAcceder(['crearCuadres']) && (
          <button onClick={() => setModal('nuevo')} className="btn-primary">
            <Plus size={15} /> Nuevo cuadre
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Total',       cuadres.length,                            'var(--text-primary)'],
          ['Efectivo',    fmt(totalEfectivo),                        '#22c55e'           ],
          ['Tarjetas',    fmt(totalTarjeta),                         '#3b82f6'           ],
          ['Canceladas',  cuadres.reduce((s, c) => s + (Number(c.cantidadCancelado) || 0), 0), '#ef4444'],
        ].map(([l, v, color]) => (
          <div key={l} className="card text-center py-3">
            <p className="text-xl font-extrabold tabular-nums break-words" style={{ color }}>{v}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{l}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="label">Desde</label>
          <input type="date" className="input w-36" value={desde} onChange={e => setDesde(e.target.value)} />
        </div>
        <div>
          <label className="label">Hasta</label>
          <input type="date" className="input w-36" value={hasta} onChange={e => setHasta(e.target.value)} />
        </div>
        <button onClick={() => { setDesde(''); setHasta('') }} className="btn-secondary btn-sm">Limpiar</button>
      </div>

      <div className="tbl-wrap">
        <table className="tbl table-fixed w-full">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th className="w-40">Cajero</th>
              <th className="w-32">Fecha</th>
              <th className="w-28 text-right">Efectivo</th>
              <th className="w-28 text-right">Cheque</th>
              <th className="w-28 text-right">Tarjeta</th>
              <th className="w-28 text-right">Transfer.</th>
              <th className="w-28 text-right">Total</th>
              <th className="w-14">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? <tr><td colSpan={9} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Cargando...</td></tr>
              : cuadres.length === 0
                ? <tr><td colSpan={9} className="text-center py-12">
                    <TrendingUp size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                    <p style={{ color: 'var(--text-muted)' }}>No hay cuadres</p>
                  </td></tr>
                : cuadres.map(c => (
                    <tr key={c.cuadreId}>
                      <td className="font-bold text-sm" style={{ color: 'var(--brand)' }}>#{c.cuadreId}</td>
                      <td className="font-medium text-sm truncate">{c.usuarioNombre || '—'}</td>
                      <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{fechaCorta(c.fecha)}</td>
                      <td className="text-start text-sm tabular-nums" style={{ color: 'var(--text-secondary)' }}>{fmt(c.totalEfectivo)}</td>
                      <td className="text-start text-sm tabular-nums" style={{ color: 'var(--text-secondary)' }}>{fmt(c.totalCheque)}</td>
                      <td className="text-start text-sm tabular-nums" style={{ color: 'var(--text-secondary)' }}>{fmt(c.totalTarjeta)}</td>
                      <td className="text-start text-sm tabular-nums" style={{ color: 'var(--text-secondary)' }}>{fmt(c.totalTransaccion)}</td>
                      <td className="text-start font-semibold text-sm tabular-nums">{fmt(c.total)}</td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => setModal({ ver: c.cuadreId })} className="btn-ghost btn-icon btn-sm" title="Ver">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => handleImprimir(c.cuadreId)} className="btn-ghost btn-icon btn-sm" title="Imprimir">
                            <Printer size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
            }
          </tbody>
        </table>
      </div>

      {modal === 'nuevo' && <NuevoCuadreModal onClose={() => setModal(null)} />}
      {modal?.ver && <CuadreDetalle cuadreId={modal.ver} onClose={() => setModal(null)} onImprimir={handleImprimir} />}
    </div>
  )
}
