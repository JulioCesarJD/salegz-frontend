import React, { useState } from 'react';
import { Plus, Search, Edit2, Shield, Trash2, Building2 } from 'lucide-react';
import { usePermiso } from '../hooks/usePermiso';
import { P } from '../store/permisosStore';
import { useEscuelas, useCreateEscuela, useUpdateEscuela, useDeleteEscuela } from '../hooks/useEscuelas';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EscuelaModal } from '../components/features/cocina/EscuelaModal';

export function EscuelasPage() {
  const { puedeVer, tienePermiso } = usePermiso();
  const puedeAcceder = puedeVer(P.Escuelas.Ver);
  const puedeCrear = tienePermiso(P.Escuelas.Crear);
  const puedeEditar = tienePermiso(P.Escuelas.Editar);
  const puedeEliminar = tienePermiso(P.Escuelas.Eliminar);

  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Sin Escuelas.Ver no se hacen peticiones: evita el 403 y el toast redundante.
  const { data: escuelas = [], isLoading } = useEscuelas({ pageSize: 200 }, { enabled: puedeAcceder });
  const create = useCreateEscuela(() => setModal(null));
  const update = useUpdateEscuela(() => setModal(null));
  const remove = useDeleteEscuela();

  if (!puedeAcceder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p style={{ color: 'var(--text-muted)' }}>No tienes permisos para acceder a escuelas</p>
        </div>
      </div>
    );
  }

  const list = escuelas.filter((e) => {
    const q = search.toLowerCase();
    const matchQ = !q ||
      (e.nombre || '').toLowerCase().includes(q) ||
      (e.codigo || '').toLowerCase().includes(q) ||
      (e.institucion || '').toLowerCase().includes(q) ||
      (e.encargado || '').toLowerCase().includes(q) ||
      (e.director || '').toLowerCase().includes(q) ||
      (e.provincia || '').toLowerCase().includes(q);
    const matchEstado =
      filtroEstado === '' || String(Boolean(e.estado)) === filtroEstado;
    return matchQ && matchEstado;
  });

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Escuelas</h1>
          <p className="page-sub">
            {escuelas.length} escuelas · {escuelas.filter((e) => e.estado).length} activas
          </p>
        </div>
        {puedeCrear && (
          <button onClick={() => setModal({})} className="btn-primary">
            <Plus size={15} /> Nueva escuela
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            className="input pl-8"
            placeholder="Buscar código, nombre, institución, director..."
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
              <th>Escuela</th>
              <th>Institución / Director</th>
              <th>Teléfono</th>
              <th>Ubicación</th>
              <th className="text-right">Estudiantes</th>
              <th className="text-right">Orden</th>
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
                  <p style={{ color: 'var(--text-muted)' }}>No hay escuelas</p>
                </td>
              </tr>
            ) : list.map((e) => (
              <tr key={e.escuelaId}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <Building2 size={14} style={{ color: 'var(--brand)' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{e.nombre}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {e.codigo || 'Sin código'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="text-sm">
                  <p>{e.institucion || '—'}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{e.director || e.encargado || '—'}</p>
                </td>
                <td className="text-sm">{e.telefono || '—'}</td>
                <td className="text-sm">
                  {e.provincia || '—'}
                  {e.municipio ? ` / ${e.municipio}` : ''}
                  {e.distrito ? ` / ${e.distrito}` : ''}
                </td>
                <td className="text-right text-sm tabular-nums">{e.cantidadEstudiante ?? '—'}</td>
                <td className="text-right text-sm tabular-nums">{e.orden ?? '—'}</td>
                <td>
                  <span className={e.estado ? 'badge badge-green' : 'badge badge-gray'}>
                    {e.estado ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td>
                  <div className="flex gap-1">
                    {puedeEditar && (
                      <button onClick={() => setModal(e)} className="btn-ghost btn-icon btn-sm" title="Editar"><Edit2 size={14} /></button>
                    )}
                    {puedeEliminar && (
                      <button onClick={() => setDeleteTarget(e)} className="btn-ghost btn-icon btn-sm text-red-500" title="Eliminar"><Trash2 size={14} /></button>
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
        onConfirm={() => { remove.mutate(deleteTarget.escuelaId); setDeleteTarget(null); }}
        title="Eliminar escuela"
        message={`¿Eliminar escuela '${deleteTarget?.nombre || ''}'? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {modal !== null && (
        <EscuelaModal
          escuela={modal?.escuelaId ? modal : null}
          onClose={() => setModal(null)}
          busy={create.isPending || update.isPending}
          onSave={(d) => (modal?.escuelaId
            ? update.mutate({ escuelaId: modal.escuelaId, data: d })
            : create.mutate(d))}
        />
      )}
    </div>
  );
}
