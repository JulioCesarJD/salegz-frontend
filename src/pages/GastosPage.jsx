import React, { useState } from 'react';
import { Plus, Search, Eye, DollarSign, Tag } from 'lucide-react';
import { usePermiso } from '../hooks/usePermiso';
import { useGastos } from '../hooks/useGastos';
import { fmt } from '../utils/format';
import { ConceptosModal } from '../components/features/gastos/ConceptosModal';
import { NuevoGastoModal } from '../components/features/gastos/NuevoGastoModal';
import { GastoDetalle } from '../components/features/gastos/GastoDetalle';

export function GastosPage() {
  const { puedeVer, puedeAcceder } = usePermiso();

  // Verificar acceso a Gastos
  if (!puedeVer('verGastos')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold mb-2">
            Acceso Denegado
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            No tienes permisos para acceder a gastos
          </p>
        </div>
      </div>
    )
  }

  const [search, setSearch] = useState('');
  const [modal,  setModal]  = useState(null);

  const { data: gastos = [], isLoading } = useGastos();

  const list = gastos.filter(g => {
    const q = search.toLowerCase();
    return !q || g.usuario?.toLowerCase().includes(q) || String(g.gastosId).includes(q);
  });
  
  const totalMes = gastos.reduce((s, g) => s + g.total, 0);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gastos</h1>
          <p className="page-sub">{gastos.length} gastos registrados</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModal('conceptos')} className="btn-secondary">
            <Tag size={15} /> Conceptos
          </button>
          {puedeAcceder(['crearGastos']) && (
            <button onClick={() => setModal('nuevo')} className="btn-primary">
              <Plus size={15} /> Nuevo gasto
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20">
            <DollarSign size={18} className="text-red-500" />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total gastos</p>
            <p className="text-lg font-extrabold text-red-500">{fmt(totalMes)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800">
            <Tag size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Registros</p>
            <p className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>{gastos.length}</p>
          </div>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input className="input pl-8" placeholder="Buscar usuario o #..."
               value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="tbl-wrap">
        <table className="tbl table-fixed w-full">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th className="w-44">Usuario</th>
              <th className="w-28">Fecha</th>
              <th className="w-20 text-center">Conceptos</th>
              <th className="w-32 text-right">Total</th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? <tr><td colSpan={6} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Cargando...</td></tr>
              : list.length === 0
                ? <tr><td colSpan={6} className="text-center py-12">
                    <DollarSign size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                    <p style={{ color: 'var(--text-muted)' }}>No hay gastos</p>
                  </td></tr>
                : list.map(g => (
                    <tr key={g.gastosId}>
                      <td className="font-bold text-sm" style={{ color: 'var(--brand)' }}>#{g.gastosId}</td>
                      <td className="font-medium text-sm truncate">{g.usuario}</td>
                      <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(g.fecha).toLocaleDateString('es-DO')}
                      </td>
                      <td className="text-center">
                        <span className="badge badge-gray">{g.detalles?.length || '—'}</span>
                      </td>
                      <td className="text-right font-semibold text-sm tabular-nums">{fmt(g.total)}</td>
                      <td>
                        <button onClick={() => setModal({ ver: g.gastosId })} className="btn-ghost btn-icon btn-sm">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
            }
          </tbody>
        </table>
      </div>

      {modal === 'nuevo'     && <NuevoGastoModal onClose={() => setModal(null)} />}
      {modal === 'conceptos' && <ConceptosModal  onClose={() => setModal(null)} />}
      {modal?.ver            && <GastoDetalle gastoId={modal.ver} onClose={() => setModal(null)} />}
    </div>
  );
}
