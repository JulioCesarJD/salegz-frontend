import React, { useState } from 'react';
import { Plus, Search, Edit2, Shield, Trash2, UtensilsCrossed } from 'lucide-react';
import { usePermiso } from '../hooks/usePermiso';
import { P } from '../store/permisosStore';
import { useMenuComida, useCreateMenuComida, useUpdateMenuComida, useDeleteMenuComida } from '../hooks/useMenuComida';
import { useProductos } from '../hooks/useProductos';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { MenuComidaModal } from '../components/features/cocina/MenuComidaModal';
import { fmt } from '../utils/format';

export function MenuComidaPage() {
  const { puedeVer, tienePermiso } = usePermiso();
  const puedeAcceder = puedeVer(P.MenuComida.Ver);
  const puedeCrear = tienePermiso(P.MenuComida.Crear);
  const puedeEditar = tienePermiso(P.MenuComida.Editar);
  const puedeEliminar = tienePermiso(P.MenuComida.Eliminar);
  const puedeVerProductos = puedeVer(P.Productos.Ver);

  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: menu = [], isLoading } = useMenuComida({ pageSize: 200 }, { enabled: puedeAcceder });
  // Los ingredientes (detalles) se capturan contra el catálogo de productos.
  const { data: productos = [] } = useProductos(
    { pageSize: 200 },
    { enabled: puedeAcceder && puedeVerProductos }
  );

  const create = useCreateMenuComida(() => setModal(null));
  const update = useUpdateMenuComida(() => setModal(null));
  const remove = useDeleteMenuComida();

  if (!puedeAcceder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p style={{ color: 'var(--text-muted)' }}>No tienes permisos para acceder al menú de comida</p>
        </div>
      </div>
    );
  }

  const list = menu.filter((m) => {
    const q = search.toLowerCase();
    const matchQ = !q ||
      (m.nombre || '').toLowerCase().includes(q) ||
      (m.detalles || []).some((d) => (d.productoDescripcion || '').toLowerCase().includes(q));
    const matchEstado = filtroEstado === '' || String(Boolean(m.estado)) === filtroEstado;
    return matchQ && matchEstado;
  });

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Menú Comida</h1>
          <p className="page-sub">
            {menu.length} platos · {menu.filter((m) => m.estado).length} activos
          </p>
        </div>
        {puedeCrear && (
          <button onClick={() => setModal({})} className="btn-primary">
            <Plus size={15} /> Nuevo plato
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            className="input pl-8"
            placeholder="Buscar plato o ingrediente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-40"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Plato</th>
              <th className="text-right">Precio</th>
              <th className="text-right">Costo</th>
              <th className="text-right">Margen</th>
              <th className="text-right">Ingredientes</th>
              <th>Estado</th>
              <th className="w-24"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-10">Cargando...</td></tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <Shield size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-muted)' }}>No hay platos en el menú</p>
                </td>
              </tr>
            ) : list.map((m) => (
              <tr key={m.menuComidaId}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <UtensilsCrossed size={14} style={{ color: 'var(--brand)' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{m.nombre}</p>
                      {(m.detalles?.length ?? 0) > 0 && (
                        <p className="text-xs truncate max-w-[260px]" style={{ color: 'var(--text-muted)' }}>
                          {m.detalles.map((d) => d.productoDescripcion).filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="text-right text-sm tabular-nums">{fmt(m.precio)}</td>
                <td className="text-right text-sm tabular-nums">{fmt(m.costo)}</td>
                <td className="text-right text-sm tabular-nums">{fmt((m.precio || 0) - (m.costo || 0))}</td>
                <td className="text-right text-sm tabular-nums">{m.detalles?.length ?? 0}</td>
                <td>
                  <span className={m.estado ? 'badge badge-green' : 'badge badge-gray'}>
                    {m.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="flex gap-1">
                    {puedeEditar && (
                      <button onClick={() => setModal(m)} className="btn-ghost btn-icon btn-sm" title="Editar"><Edit2 size={14} /></button>
                    )}
                    {puedeEliminar && (
                      <button onClick={() => setDeleteTarget(m)} className="btn-ghost btn-icon btn-sm text-red-500" title="Eliminar"><Trash2 size={14} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { remove.mutate(deleteTarget.menuComidaId); setDeleteTarget(null); }}
        title="Eliminar plato"
        message={`¿Eliminar el plato '${deleteTarget?.nombre || ''}'? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {modal !== null && (
        <MenuComidaModal
          menu={modal?.menuComidaId ? modal : null}
          productos={productos}
          puedeEditarDetalles={puedeVerProductos}
          onClose={() => setModal(null)}
          busy={create.isPending || update.isPending}
          onSave={(d) => (modal?.menuComidaId
            ? update.mutate({ menuComidaId: modal.menuComidaId, data: d })
            : create.mutate(d))}
        />
      )}
    </div>
  );
}
