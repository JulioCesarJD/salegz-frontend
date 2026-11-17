import React, { useState } from 'react';
import { Plus, Search, Edit2, Shield, Trash2, ChefHat } from 'lucide-react';
import { usePermiso } from '../hooks/usePermiso';
import { P } from '../store/permisosStore';
import { useRecetas, useCreateReceta, useUpdateReceta, useDeleteReceta } from '../hooks/useRecetas';
import { useProductos } from '../hooks/useProductos';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { RecetaModal } from '../components/features/cocina/RecetaModal';
import { fmt } from '../utils/format';

export function RecetasPage() {
  const { puedeVer, tienePermiso } = usePermiso();
  const puedeAcceder = puedeVer(P.Recetas.Ver);
  const puedeCrear = tienePermiso(P.Recetas.Crear);
  const puedeEditar = tienePermiso(P.Recetas.Editar);
  const puedeEliminar = tienePermiso(P.Recetas.Eliminar);
  const puedeVerProductos = puedeVer(P.Productos.Ver);

  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: recetas = [], isLoading } = useRecetas({ pageSize: 200 }, { enabled: puedeAcceder });
  const { data: productos = [] } = useProductos(
    { pageSize: 200 },
    { enabled: puedeAcceder && puedeVerProductos }
  );

  const create = useCreateReceta(() => setModal(null));
  const update = useUpdateReceta(() => setModal(null));
  const remove = useDeleteReceta();

  if (!puedeAcceder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p style={{ color: 'var(--text-muted)' }}>No tienes permisos para acceder a recetas</p>
        </div>
      </div>
    );
  }

  const list = recetas.filter((r) => {
    const q = search.toLowerCase();
    const matchQ = !q ||
      (r.nombre || '').toLowerCase().includes(q) ||
      (r.codigo || '').toLowerCase().includes(q) ||
      (r.descripcion || '').toLowerCase().includes(q);
    const matchEstado = filtroEstado === '' || String(Boolean(r.estado)) === filtroEstado;
    return matchQ && matchEstado;
  });

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Recetas</h1>
          <p className="page-sub">
            {recetas.length} recetas · {recetas.filter((r) => r.estado).length} activas
          </p>
        </div>
        {puedeCrear && (
          <button onClick={() => setModal({})} className="btn-primary">
            <Plus size={15} /> Nueva receta
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            className="input pl-8"
            placeholder="Buscar código, receta o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-40"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Todas</option>
          <option value="true">Activas</option>
          <option value="false">Inactivas</option>
        </select>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Receta</th>
              <th className="text-right">Porciones base</th>
              <th className="text-right">Precio venta</th>
              <th className="text-right">Costo</th>
              <th className="text-right">Margen</th>
              <th className="text-right">Ingredientes</th>
              <th>Estado</th>
              <th className="w-24"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-10">Cargando...</td></tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12">
                  <Shield size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-muted)' }}>No hay recetas registradas</p>
                </td>
              </tr>
            ) : list.map((r) => (
              <tr key={r.recetaId}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <ChefHat size={14} style={{ color: 'var(--brand)' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{r.nombre}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {r.codigo || 'Sin código'}{r.descripcion ? ` · ${r.descripcion}` : ''}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="text-right text-sm tabular-nums">{r.porcionesBase}</td>
                <td className="text-right text-sm tabular-nums">{fmt(r.precioVenta)}</td>
                <td className="text-right text-sm tabular-nums">{fmt(r.costo)}</td>
                <td className="text-right text-sm tabular-nums">{fmt((r.precioVenta || 0) - (r.costo || 0))}</td>
                <td className="text-right text-sm tabular-nums">{r.ingredientes?.length ?? 0}</td>
                <td>
                  <span className={r.estado ? 'badge badge-green' : 'badge badge-gray'}>
                    {r.estado ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td>
                  <div className="flex gap-1">
                    {puedeEditar && (
                      <button onClick={() => setModal(r)} className="btn-ghost btn-icon btn-sm" title="Editar"><Edit2 size={14} /></button>
                    )}
                    {puedeEliminar && (
                      <button onClick={() => setDeleteTarget(r)} className="btn-ghost btn-icon btn-sm text-red-500" title="Eliminar"><Trash2 size={14} /></button>
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
        onConfirm={() => { remove.mutate(deleteTarget.recetaId); setDeleteTarget(null); }}
        title="Eliminar receta"
        message={`¿Eliminar la receta '${deleteTarget?.nombre || ''}'? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {modal !== null && (
        <RecetaModal
          receta={modal?.recetaId ? modal : null}
          productos={productos}
          puedeEditarIngredientes={puedeVerProductos}
          onClose={() => setModal(null)}
          busy={create.isPending || update.isPending}
          onSave={(d) => (modal?.recetaId
            ? update.mutate({ recetaId: modal.recetaId, data: d })
            : create.mutate(d))}
        />
      )}
    </div>
  );
}
