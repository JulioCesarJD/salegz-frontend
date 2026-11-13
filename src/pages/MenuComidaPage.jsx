import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Search, Edit2, Shield, Trash2, UtensilsCrossed } from 'lucide-react';
import { usePermiso } from '../hooks/usePermiso';
import { useMenuComida, useCreateMenuComida, useUpdateMenuComida, useDeleteMenuComida } from '../hooks/useMenuComida';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { fmt } from '../utils/format';

export function MenuComidaPage() {
  const { puedeVer } = usePermiso();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: menu = [], isLoading } = useMenuComida({ pageSize: 1000 });
  const create = useCreateMenuComida(() => setModal(null));
  const update = useUpdateMenuComida(() => setModal(null));
  const remove = useDeleteMenuComida();

  if (!puedeVer('verMenuComida')) {
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
    return !q || (m.nombre || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Menú Comida</h1>
          <p className="page-sub">{menu.length} platos</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary">
          <Plus size={15} /> Nuevo plato
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input className="input pl-8" placeholder="Buscar plato..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Plato</th>
              <th className="text-right w-32">Precio</th>
              <th className="text-right w-32">Costo</th>
              <th className="text-right w-32">Margen</th>
              <th className="w-40"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-10">Cargando...</td></tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
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
                    <span className="font-semibold text-sm">{m.nombre}</span>
                  </div>
                </td>
                <td className="text-right text-sm tabular-nums">{fmt(m.precio)}</td>
                <td className="text-right text-sm tabular-nums">{fmt(m.costo)}</td>
                <td className="text-right text-sm tabular-nums">{fmt((m.precio || 0) - (m.costo || 0))}</td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => setModal(m)} className="btn-ghost btn-icon btn-sm" title="Editar"><Edit2 size={14} /></button>
                    <button onClick={() => setDeleteTarget(m)} className="btn-ghost btn-icon btn-sm text-red-500" title="Eliminar"><Trash2 size={14} /></button>
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
        <MenuModal
          menu={modal?.menuComidaId ? modal : null}
          onClose={() => setModal(null)}
          busy={create.isPending || update.isPending}
          onSave={(d) => (modal?.menuComidaId
            ? update.mutate({ menuComidaId: modal.menuComidaId, data: { nombre: d.nombre, precio: Number(d.precio) || 0, costo: Number(d.costo) || 0 } })
            : create.mutate({ nombre: d.nombre, precio: Number(d.precio) || 0, costo: Number(d.costo) || 0 }))}
        />
      )}
    </div>
  );
}

function MenuModal({ menu, onClose, busy, onSave }) {
  const { register, handleSubmit } = useForm({ defaultValues: menu || {} });
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {menu?.menuComidaId ? 'Editar plato' : 'Nuevo plato'}
          </h2>
          <button onClick={onClose} className="btn-ghost btn-icon">×</button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div>
            <label className="label">Nombre *</label>
            <input className="input" placeholder="Nombre del plato" {...register('nombre', { required: true, maxLength: 200 })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Precio *</label>
              <input type="number" min="0" step="0.01" className="input text-right" placeholder="0.00" {...register('precio', { required: true, min: 0 })} />
            </div>
            <div>
              <label className="label">Costo *</label>
              <input type="number" min="0" step="0.01" className="input text-right" placeholder="0.00" {...register('costo', { required: true, min: 0 })} />
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
