import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Edit2, Package, AlertTriangle } from 'lucide-react';
import { usePermiso } from '../hooks/usePermiso';
import api from '../lib/api';
import { useProductos } from '../hooks/useProductos';
import { fmt } from '../utils/format';
import { ProductoModal } from '../components/features/productos/ProductoModal';

export function ProductosPage() {
  const { puedeVer } = usePermiso();

  // Verificar acceso a Productos
  if (!puedeVer('verProductos')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold mb-2">
            Acceso Denegado
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            No tienes permisos para acceder a productos
          </p>
        </div>
      </div>
    )
  }

  const [search,  setSearch]  = useState('');
  const [catFilt, setCatFilt] = useState('');
  const [modal,   setModal]   = useState(null);

  const { data: prods = [], isLoading } = useProductos();

  const { data: cats = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn:  () => api.get('/api/categorias').then(r => r.data),
  });

  const list = prods.filter(p => {
    const q = search.toLowerCase();
    const mQ = !q || p.descripcion.toLowerCase().includes(q) || p.referencia?.toLowerCase().includes(q) || p.codigoBarra?.includes(q);
    const mC = !catFilt || p.categoriaId === parseInt(catFilt);
    return mQ && mC;
  });

  const stockBajoCount = prods.filter(p => p.cantidad <= p.minimo).length;

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Productos</h1>
          <p className="page-sub">
            {prods.length} productos · {stockBajoCount > 0 && <span className="text-red-500">{stockBajoCount} con stock bajo</span>}
          </p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary">
          <Plus size={15} /> Nuevo producto
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input pl-8 w-64" placeholder="Buscar descripción, referencia..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-48" value={catFilt} onChange={e => setCatFilt(e.target.value)}>
          <option value="">Todas las categorías</option>
          {cats.map(c => <option key={c.categoriaId} value={c.categoriaId}>{c.descripcion}</option>)}
        </select>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Stock</th>
              <th>Costo</th>
              <th>Precio 1</th>
              <th>Precio 2</th>
              <th>ITBIS</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Cargando...</td></tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12">
                  <Package size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-muted)' }}>No hay productos</p>
                </td>
              </tr>
            ) : list.map(p => (
              <tr key={p.productoId}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <Package size={14} style={{ color: 'var(--brand)' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{p.descripcion}</p>
                      {p.referencia && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.referencia}</p>}
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-gray">{p.categoria}</span></td>
                <td>
                  <div className="flex items-center gap-1">
                    {p.cantidad <= p.minimo && <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />}
                    <span className={`font-semibold text-sm ${p.cantidad <= p.minimo ? 'text-red-500' : ''}`}>
                      {p.cantidad}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/ mín {p.minimo}</span>
                  </div>
                </td>
                <td className="text-sm">{fmt(p.costo)}</td>
                <td className="font-semibold text-sm">{fmt(p.precio1)}</td>
                <td className="text-sm">{p.precio2 > 0 ? fmt(p.precio2) : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                <td>
                  <span className={p.itbis === 1 ? 'badge badge-blue' : 'badge badge-gray'}>
                    {p.itbis === 1 ? '18%' : 'Exento'}
                  </span>
                </td>
                <td>
                  <button onClick={() => setModal(p)} className="btn-ghost btn-icon btn-sm"><Edit2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== null && (
        <ProductoModal
          prod={modal?.productoId ? modal : null}
          cats={cats}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}