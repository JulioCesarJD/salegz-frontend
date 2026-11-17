import React, { useState } from 'react';
import { Plus, Search, Edit2, Shield, Trash2, CakeSlice } from 'lucide-react';
import { usePermiso } from '../hooks/usePermiso';
import { P } from '../store/permisosStore';
import { usePostres, useCreatePostre, useUpdatePostre, useDeletePostre } from '../hooks/usePostres';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { PostreModal } from '../components/features/cocina/PostreModal';
import { fmt } from '../utils/format';

const fmtFecha = (value) =>
  value ? new Date(value).toLocaleDateString('es-DO') : '—';

export function PostresPage() {
  const { puedeVer, tienePermiso } = usePermiso();
  const puedeAcceder = puedeVer(P.Postres.Ver);
  const puedeCrear = tienePermiso(P.Postres.Crear);
  const puedeEditar = tienePermiso(P.Postres.Editar);
  const puedeEliminar = tienePermiso(P.Postres.Eliminar);

  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: postres = [], isLoading } = usePostres({ pageSize: 200 }, { enabled: puedeAcceder });
  const create = useCreatePostre(() => setModal(null));
  const update = useUpdatePostre(() => setModal(null));
  const remove = useDeletePostre();

  if (!puedeAcceder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p style={{ color: 'var(--text-muted)' }}>No tienes permisos para acceder a postres</p>
        </div>
      </div>
    );
  }

  const list = postres.filter((p) => {
    const q = search.toLowerCase();
    const matchQ = !q || (p.nombre || '').toLowerCase().includes(q);
    const matchEstado = filtroEstado === '' || String(Boolean(p.estado)) === filtroEstado;
    return matchQ && matchEstado;
  });

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Postres</h1>
          <p className="page-sub">
            {postres.length} postres · {postres.filter((p) => p.estado).length} activos
          </p>
        </div>
        {puedeCrear && (
          <button onClick={() => setModal({})} className="btn-primary">
            <Plus size={15} /> Nuevo postre
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            className="input pl-8"
            placeholder="Buscar postre..."
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
              <th>Postre</th>
              <th className="text-right">Costo</th>
              <th>Estado</th>
              <th>Registrado</th>
              <th className="w-24"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-10">Cargando...</td></tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <Shield size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-muted)' }}>No hay postres registrados</p>
                </td>
              </tr>
            ) : list.map((p) => (
              <tr key={p.postreId}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <CakeSlice size={14} style={{ color: 'var(--brand)' }} />
                    </div>
                    <span className="font-semibold text-sm">{p.nombre}</span>
                  </div>
                </td>
                <td className="text-right text-sm tabular-nums">{fmt(p.costo)}</td>
                <td>
                  <span className={p.estado ? 'badge badge-green' : 'badge badge-gray'}>
                    {p.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="text-sm">{fmtFecha(p.fechaRegistro)}</td>
                <td>
                  <div className="flex gap-1">
                    {puedeEditar && (
                      <button onClick={() => setModal(p)} className="btn-ghost btn-icon btn-sm" title="Editar"><Edit2 size={14} /></button>
                    )}
                    {puedeEliminar && (
                      <button onClick={() => setDeleteTarget(p)} className="btn-ghost btn-icon btn-sm text-red-500" title="Eliminar"><Trash2 size={14} /></button>
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
        onConfirm={() => { remove.mutate(deleteTarget.postreId); setDeleteTarget(null); }}
        title="Eliminar postre"
        message={`¿Eliminar el postre '${deleteTarget?.nombre || ''}'? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {modal !== null && (
        <PostreModal
          postre={modal?.postreId ? modal : null}
          onClose={() => setModal(null)}
          busy={create.isPending || update.isPending}
          onSave={(d) => (modal?.postreId
            ? update.mutate({ postreId: modal.postreId, data: d })
            : create.mutate(d))}
        />
      )}
    </div>
  );
}
