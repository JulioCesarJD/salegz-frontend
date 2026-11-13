import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Search, Edit2, Shield, Trash2, Building2 } from 'lucide-react';
import { usePermiso } from '../hooks/usePermiso';
import { useEscuelas, useCreateEscuela, useUpdateEscuela, useDeleteEscuela } from '../hooks/useEscuelas';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export function EscuelasPage() {
  const { puedeVer } = usePermiso();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: escuelas = [], isLoading } = useEscuelas({ pageSize: 1000 });
  const create = useCreateEscuela(() => setModal(null));
  const update = useUpdateEscuela(() => setModal(null));
  const remove = useDeleteEscuela();

  if (!puedeVer('verEscuelas')) {
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
    return !q ||
      (e.nombre || '').toLowerCase().includes(q) ||
      (e.encargado || '').toLowerCase().includes(q) ||
      (e.provincia || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Escuelas</h1>
          <p className="page-sub">{escuelas.length} escuelas</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary">
          <Plus size={15} /> Nueva escuela
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input className="input pl-8" placeholder="Buscar escuela, encargado o provincia..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Escuela</th>
              <th>Encargado</th>
              <th>Dirección</th>
              <th>Provincia / Municipio</th>
              <th>Cantidad</th>
              <th>Orden</th>
              <th className="w-40"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-10">Cargando...</td></tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
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
                    <span className="font-semibold text-sm">{e.nombre}</span>
                  </div>
                </td>
                <td className="text-sm">{e.encargado || '—'}</td>
                <td className="text-sm">{e.direccion || '—'}</td>
                <td className="text-sm">{e.provincia || '—'}{e.municipio ? ` / ${e.municipio}` : ''}</td>
                <td className="text-sm tabular-nums">{e.cantidadEstudiante ?? '—'}</td>
                <td className="text-sm tabular-nums">{e.orden ?? '—'}</td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => setModal(e)} className="btn-ghost btn-icon btn-sm" title="Editar"><Edit2 size={14} /></button>
                    <button onClick={() => setDeleteTarget(e)} className="btn-ghost btn-icon btn-sm text-red-500" title="Eliminar"><Trash2 size={14} /></button>
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
          onSave={(d) => (modal?.escuelaId ? update.mutate({ escuelaId: modal.escuelaId, data: d }) : create.mutate(d))}
        />
      )}
    </div>
  );
}

function EscuelaModal({ escuela, onClose, busy, onSave }) {
  const { register, handleSubmit } = useForm({ defaultValues: escuela || {} });
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {escuela?.escuelaId ? 'Editar escuela' : 'Nueva escuela'}
          </h2>
          <button onClick={onClose} className="btn-ghost btn-icon">×</button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div>
            <label className="label">Nombre *</label>
            <input className="input" placeholder="Nombre de la escuela" {...register('nombre', { required: true, maxLength: 200 })} />
          </div>
          <div>
            <label className="label">Encargado</label>
            <input className="input" placeholder="Responsable" {...register('encargado', { maxLength: 200 })} />
          </div>
          <div>
            <label className="label">Dirección</label>
            <input className="input" {...register('direccion', { maxLength: 300 })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Provincia</label>
              <input className="input" {...register('provincia', { maxLength: 100 })} />
            </div>
            <div>
              <label className="label">Municipio</label>
              <input className="input" {...register('municipio', { maxLength: 100 })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Distrito</label>
              <input className="input" {...register('distrito', { maxLength: 100 })} />
            </div>
            <div>
              <label className="label">Cantidad estudiantes</label>
              <input type="number" min="0" className="input" {...register('cantidadEstudiante', { valueAsNumber: true })} />
            </div>
            <div>
              <label className="label">Orden</label>
              <input type="number" min="0" className="input" {...register('orden', { valueAsNumber: true })} />
            </div>
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
