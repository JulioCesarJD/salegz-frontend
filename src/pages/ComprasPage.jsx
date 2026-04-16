import React, { useState } from 'react';
import { Plus, Search, Eye, XCircle, DollarSign, ShoppingCart } from 'lucide-react';
import { usePermiso } from '../hooks/usePermiso';
import { useCompras, useCancelarCompra } from '../hooks/useCompras';
import { fmt } from '../utils/format';
import { CompraDetalle } from '../components/features/compras/CompraDetalle';
import { SaldarModal } from '../components/features/compras/SaldarModal';
import { NuevaCompraModal } from '../components/features/compras/NuevaCompraModal';

const ESTADOS_COMPRA = {
  0: <span className="badge badge-gray">Contado</span>,
  1: <span className="badge badge-yellow">Crédito</span>,
  2: <span className="badge badge-green">Saldado</span>,
  3: <span className="badge badge-red">Cancelado</span>,
};

export function ComprasPage() {
  const { puedeVer, puedeAcceder } = usePermiso();

  // Verificar acceso a Compras
  if (!puedeVer('verCompras')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold mb-2">
            Acceso Denegado
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            No tienes permisos para acceder a compras
          </p>
        </div>
      </div>
    )
  }

  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [modal,  setModal]  = useState(null);

  const { data: compras = [], isLoading } = useCompras(estado);
  const cancelarMutation = useCancelarCompra();

  const list = compras.filter(c => { 
    const q = search.toLowerCase(); 
    return !q || (c.nombreCliente||'').toLowerCase().includes(q) || String(c.compraId).includes(q); 
  });
  
  const totalCompras = compras.reduce((s, c) => c.estado !== 3 ? s + c.total : s, 0);
  const porPagar     = compras.filter(c => c.estado === 1).length;

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Compras</h1>
          <p className="page-sub">{compras.length} compras registradas</p>
        </div>
        {puedeAcceder(['crearCompras']) && (
          <button onClick={() => setModal('nueva')} className="btn-primary">
            <Plus size={15} /> Nueva compra
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Total',      compras.length,                          'var(--text-primary)'],
          ['Contado',    compras.filter(c=>c.estado===0).length,  'var(--text-secondary)'],
          ['Crédito',    compras.filter(c=>c.estado===1).length,  '#f59e0b'],
          ['Canceladas', compras.filter(c=>c.estado===3).length,  'var(--text-muted)'],
        ].map(([l, v, color]) => (
          <div key={l} className="card text-center py-3">
            <p className="text-xl font-extrabold" style={{ color }}>{v}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{l}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20">
            <ShoppingCart size={18} className="text-blue-500" />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total en compras</p>
            <p className="text-lg font-extrabold text-blue-500">{fmt(totalCompras)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
            <DollarSign size={18} className="text-yellow-500" />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Cuentas por pagar</p>
            <p className="text-lg font-extrabold text-yellow-500">{porPagar} pendientes</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input pl-8 w-60" placeholder="Buscar proveedor o # compra..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-40" value={estado} onChange={e => setEstado(e.target.value)}>
          <option value="">Todos</option>
          <option value="0">Contado</option>
          <option value="1">Crédito</option>
          <option value="2">Saldado</option>
          <option value="3">Cancelado</option>
        </select>
      </div>

      <div className="tbl-wrap">
        <table className="tbl table-fixed w-full">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th className="w-44">Proveedor</th>
              <th className="w-24">Fecha</th>
              <th className="w-28">Tipo pago</th>
              <th className="w-32 text-right">Total</th>
              <th className="w-24">Estado</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Cargando...</td></tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <ShoppingCart size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-muted)' }}>No hay compras</p>
                </td>
              </tr>
            ) : list.map(c => (
              <tr key={c.compraId}>
                <td className="font-bold text-sm" style={{ color: 'var(--brand)' }}>#{c.compraId}</td>
                <td className="font-medium text-sm truncate">{c.nombreCliente || 'Sin proveedor'}</td>
                <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(c.fecha).toLocaleDateString('es-DO')}
                </td>
                <td><span className="badge badge-gray">{c.tipoPago}</span></td>
                <td className="text-start font-semibold text-sm tabular-nums">{fmt(c.total)}</td>
                <td>{ESTADOS_COMPRA[c.estado]}</td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => setModal({ ver: c.compraId })}
                      className="btn-ghost btn-icon btn-sm" title="Ver">
                      <Eye size={14} />
                    </button>
                    {c.estado === 1 && (
                      <button onClick={() => setModal({ saldar: true, compra: c })}
                        className="btn-ghost btn-icon btn-sm text-green-500" title="Registrar pago">
                        <DollarSign size={14} />
                      </button>
                    )}
                    {c.estado !== 3 && (
                      <button onClick={() => { if (confirm('¿Cancelar esta compra?')) cancelarMutation.mutate(c.compraId); }}
                        className="btn-ghost btn-icon btn-sm text-red-400" title="Cancelar">
                        <XCircle size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === 'nueva' && <NuevaCompraModal onClose={() => setModal(null)} />}
      {modal?.ver    && <CompraDetalle compraId={modal.ver} onClose={() => setModal(null)} />}
      {modal?.saldar && <SaldarModal compra={modal.compra} onClose={() => setModal(null)} />}
    </div>
  );
}
