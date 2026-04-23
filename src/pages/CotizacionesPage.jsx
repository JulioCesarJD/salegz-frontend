import React, { useState } from 'react';
import { Plus, Search, Eye, ArrowRightCircle, ClipboardList } from 'lucide-react';
import { useCotizaciones } from '../hooks/useCotizaciones';
import { usePermiso } from '../hooks/usePermiso';
import { fmt } from '../utils/format';
import { NuevaCotizacionModal } from '../components/features/cotizaciones/NuevaCotizacionModal';
import { CotizacionDetalle } from '../components/features/cotizaciones/CotizacionDetalle';

export function CotizacionesPage() {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const { puedeVer: puedeVerCotizaciones, puedeAcceder: puedeCrear } = usePermiso()

  // Si no puede ver cotizaciones, mostrar acceso denegado
  if (!puedeVerCotizaciones('verCotizaciones')) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <h2 style={{ color: 'var(--text-primary)' }} className="text-xl sm:text-2xl font-bold mb-2">
            Acceso Denegado
          </h2>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm sm:text-base">
            No tienes permisos para acceder a cotizaciones
          </p>
        </div>
      </div>
    )
  }

  const { data: cotizaciones = [], isLoading } = useCotizaciones();

  const list = cotizaciones.filter(c => {
    const q = search.toLowerCase();
    return !q || (c.nombreCliente || '').toLowerCase().includes(q) || String(c.cotizacionId).includes(q);
  });

  const totalCotizado = cotizaciones.reduce((s, c) => s + c.total, 0);

  return (
    <div className="space-y-4 sm:space-y-5 px-4 sm:px-0">
      {/* Header responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Cotizaciones</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{cotizaciones.length} cotizaciones</p>
        </div>
        {puedeCrear(['crearCotizaciones']) && (
          <button onClick={() => setModal('nueva')} className="btn-primary w-full sm:w-auto">
            <Plus size={15} /> Nueva cotización
          </button>
        )}
      </div>

      {/* Stats responsivos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="card flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20">
            <ClipboardList size={16} className="sm:w-[18px] sm:h-[18px] text-blue-500" />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total cotizaciones</p>
            <p className="text-base sm:text-lg font-extrabold text-blue-500">{cotizaciones.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-green-50 dark:bg-green-900/20">
            <ArrowRightCircle size={16} className="sm:w-[18px] sm:h-[18px] text-green-500" />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Valor total cotizado</p>
            <p className="text-base sm:text-lg font-extrabold text-green-500 break-words">{fmt(totalCotizado)}</p>
          </div>
        </div>
      </div>

      {/* Búsqueda responsiva */}
      <div className="relative w-full sm:max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input 
          className="input pl-8 w-full" 
          placeholder="Buscar cliente o # cotización..."
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
      </div>

      {/* Tabla responsiva con scroll horizontal */}
      <div className="tbl-wrap overflow-x-auto">
        <table className="tbl min-w-[700px] sm:min-w-full">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th className="min-w-[150px] sm:w-48">Cliente</th>
              <th className="w-28">Fecha</th>
              <th className="w-32 text-right">ITBIS</th>
              <th className="w-32 text-right">Total</th>
              <th className="w-24">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Cargando...</td></tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <ClipboardList size={24} className="sm:w-[28px] sm:h-[28px] mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-muted)' }} className="text-sm">No hay cotizaciones</p>
                </td>
              </tr>
            ) : list.map(c => (
              <tr key={c.cotizacionId}>
                <td className="font-bold text-sm whitespace-nowrap" style={{ color: 'var(--brand)' }}>#{c.cotizacionId}</td>
                <td className="font-medium text-sm break-words max-w-[200px] sm:max-w-none">
                  {c.nombreCliente || 'Sin cliente'}
                </td>
                <td className="text-sm whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(c.fecha).toLocaleDateString('es-DO')}
                </td>
                <td className="text-start text-sm tabular-nums whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                  {fmt(c.itbis)}
                </td>
                <td className="text-start font-semibold text-sm tabular-nums whitespace-nowrap">{fmt(c.total)}</td>
                <td>
                  <div className="flex gap-1 justify-start">
                    <button
                      onClick={() => setModal({ ver: c.cotizacionId })}
                      className="btn-ghost btn-icon btn-sm" 
                      title="Ver / Convertir">
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => setModal({ ver: c.cotizacionId })}
                      className="btn-ghost btn-icon btn-sm text-green-500" 
                      title="Convertir a factura">
                      <ArrowRightCircle size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      {modal === 'nueva' && <NuevaCotizacionModal onClose={() => setModal(null)} />}
      {modal?.ver && <CotizacionDetalle cotizacionId={modal.ver} onClose={() => setModal(null)} />}
    </div>
  );
}