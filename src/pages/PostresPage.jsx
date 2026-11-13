import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Search, Edit2, Shield, Trash2, CakeSlice } from 'lucide-react';
import { usePermiso } from '../hooks/usePermiso';
import { usePostres, useCreatePostre, useUpdatePostre, useDeletePostre } from '../hooks/usePostres';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export function PostresPage() {
  const { puedeVer } = usePermiso();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: postres = [], isLoading } = usePostres({ pageSize: 1000 });
  const create = useCreatePostre(() => setModal(null));
  const update = useUpdatePostre(() => setModal(null));
  const remove = useDeletePostre();

  if (!puedeVer('verPostres')) {
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
    return !q || (p.nombre || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Postres</h1>
          <p className="page-sub">{postres.length} postres</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary">
          <Plus size={15} /> Nuevo postre
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input className="input pl-8" placeholder="Buscar postre..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Postre</th>
              <th className="w-40"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={2} className="text-center py-10">Cargando...</td></tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center py-12">
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
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => setModal(p)} className="btn-ghost btn-icon btn-sm" title="Editar"><Edit2 size={14} /></button>
                    <button onClick={() => setDeleteTarget(p)} className="btn-ghost btn-icon btn-sm text-red-500" title="Eliminar"><Trash2 size={14} /></button>
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

function PostreModal({ postre, onClose, busy, onSave }) {
  const { register, handleSubmit } = useForm({ defaultValues: postre || {} });
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {postre?.postreId ? 'Editar postre' : 'Nuevo postre'}
          </h2>
          <button onClick={onClose} className="btn-ghost btn-icon">×</button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div>
            <label className="label">Nombre *</label>
            <input className="input" placeholder="Nombre del postre" {...register('nombre', { required: true, maxLength: 200 })} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">{busy ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
