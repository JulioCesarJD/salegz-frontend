import React, { useState } from 'react';
import { Plus, Eye, TrendingUp } from 'lucide-react';
import { usePermiso } from '../hooks/usePermiso';
import { useCuadres } from '../hooks/useCuadres';
import { ESTADO_CUADRE } from '../constants/cuadres';
import { fmt } from '../utils/format';
import { NuevoCuadreModal } from '../components/features/cuadres/NuevoCuadreModal';
import { CuadreDetalle } from '../components/features/cuadres/CuadreDetalle';

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
          ['Total',          cuadres.length,                                 'var(--text-primary)'],
          ['Aprobados',      cuadres.filter(c=>c.estadoCuadre===1).length,   '#22c55e'           ],
          ['Con diferencia', cuadres.filter(c=>c.estadoCuadre===2).length,   '#ef4444'           ],
          ['Pendientes',     cuadres.filter(c=>c.estadoCuadre===0).length,   '#f59e0b'           ],
        ].map(([l, v, color]) => (
          <div key={l} className="card text-center py-3">
            <p className="text-xl font-extrabold" style={{ color }}>{v}</p>
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
              <th className="w-28 text-right">Fondo ini.</th>
              <th className="w-28 text-right">Ventas sis.</th>
              <th className="w-28 text-right">Total</th>
              <th className="w-28 text-right">Diferencia</th>
              <th className="w-28">Estado</th>
              <th className="w-14"></th>
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
                : cuadres.map(c => {
                    const dif      = c.diferencia || 0
                    const difColor = dif === 0 ? 'var(--text-muted)' : dif > 0 ? '#3b82f6' : '#ef4444'
                    return (
                      <tr key={c.cuadreId}>
                        <td className="font-bold text-sm" style={{ color: 'var(--brand)' }}>#{c.cuadreId}</td>
                        <td className="font-medium text-sm truncate">{c.usuario}</td>
                        <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{new Date(c.fecha).toLocaleDateString('es-DO')}</td>
                        <td className="text-right text-sm tabular-nums" style={{ color: 'var(--text-secondary)' }}>{fmt(c.fondoInicial)}</td>
                        <td className="text-right text-sm tabular-nums" style={{ color: 'var(--text-secondary)' }}>{fmt(c.ventasSistema)}</td>
                        <td className="text-right font-semibold text-sm tabular-nums">{fmt(c.total)}</td>
                        <td className="text-right text-sm tabular-nums font-semibold" style={{ color: difColor }}>
                          {dif === 0 ? '—' : `${dif > 0 ? '+' : ''}${fmt(Math.abs(dif))}`}
                        </td>
                        <td>{ESTADO_CUADRE[c.estadoCuadre ?? 0]}</td>
                        <td>
                          <button onClick={() => setModal({ ver: c.cuadreId })} className="btn-ghost btn-icon btn-sm">
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
            }
          </tbody>
        </table>
      </div>

      {modal === 'nuevo' && <NuevoCuadreModal onClose={() => setModal(null)} />}
      {modal?.ver && <CuadreDetalle cuadreId={modal.ver} onClose={() => setModal(null)} />}
    </div>
  )
}