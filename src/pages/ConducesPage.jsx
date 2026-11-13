import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Search, Edit2, Shield, Trash2, CalendarCheck, BusFront } from 'lucide-react';
import { usePermiso } from '../hooks/usePermiso';
import { useConduces, useCreateConduce, useUpdateConduce, useDeleteConduce, useGenerarJornada } from '../hooks/useConduces';
import { useEscuelas } from '../hooks/useEscuelas';
import { useMenuComida } from '../hooks/useMenuComida';
import { usePostres } from '../hooks/usePostres';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

const ESTADOS = { 0: 'No entrega', 1: 'Entrega', 2: 'Entregado' };
const ESTADOS_BADGE = { 0: 'badge badge-gray', 1: 'badge badge-yellow', 2: 'badge badge-green' };
const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');

export function ConducesPage() {
  const { puedeVer } = usePermiso();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: conduces = [], isLoading } = useConduces({ pageSize: 1000 });
  const create = useCreateConduce(() => setModal(null));
  const update = useUpdateConduce(() => setModal(null));
  const remove = useDeleteConduce();
  const jornada = useGenerarJornada(() => setModal(null));

  const { data: escuelas = [] } = useEscuelas({ pageSize: 1000 });
  const { data: menu = [] } = useMenuComida({ pageSize: 1000 });
  const { data: postres = [] } = usePostres({ pageSize: 1000 });

  if (!puedeVer('verConduces')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p style={{ color: 'var(--text-muted)' }}>No tienes permisos para acceder a conduces</p>
        </div>
      </div>
    );
  }

  const list = conduces.filter((c) => {
    const q = search.toLowerCase();
    return !q ||
      String(c.numeroConduce ?? '').includes(q) ||
      (c.escuelaNombre || '').toLowerCase().includes(q) ||
      (c.menuComidaNombre || '').toLowerCase().includes(q) ||
      (c.postreNombre || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Conduces</h1>
          <p className="page-sub">{conduces.length} conduces</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModal({ tipo: 'jornada' })} className="btn-secondary">
            <CalendarCheck size={15} /> Generar jornada
          </button>
          <button onClick={() => setModal({ tipo: 'nuevo' })} className="btn-primary">
            <Plus size={15} /> Nuevo conduce
          </button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input className="input pl-8" placeholder="Buscar # conduce, escuela, menú o postre..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>#</th>
              <th>Escuela</th>
              <th>Menú</th>
              <th>Postre</th>
              <th>Fecha</th>
              <th>Estado</th>
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
                  <p style={{ color: 'var(--text-muted)' }}>No hay conduces registrados</p>
                </td>
              </tr>
            ) : list.map((c) => (
              <tr key={c.conduceId}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <BusFront size={14} style={{ color: 'var(--brand)' }} />
                    </div>
                    <span className="font-semibold text-sm">{c.numeroConduce ?? '—'}</span>
                  </div>
                </td>
                <td className="text-sm">{c.escuelaNombre || '—'}</td>
                <td className="text-sm">{c.menuComidaNombre || '—'}</td>
                <td className="text-sm">{c.postreNombre || '—'}</td>
                <td className="text-sm">{c.fecha ? new Date(c.fecha).toLocaleDateString('es-DO') : '—'}</td>
                <td><span className={ESTADOS_BADGE[c.estado] || 'badge badge-gray'}>{ESTADOS[c.estado] || c.estadoNombre || '—'}</span></td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => setModal({ tipo: 'editar', conduce: c })} className="btn-ghost btn-icon btn-sm" title="Editar"><Edit2 size={14} /></button>
                    <button onClick={() => setDeleteTarget(c)} className="btn-ghost btn-icon btn-sm text-red-500" title="Eliminar"><Trash2 size={14} /></button>
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
        onConfirm={() => { remove.mutate(deleteTarget.conduceId); setDeleteTarget(null); }}
        title="Eliminar conduce"
        message={`¿Eliminar el conduce ${deleteTarget?.numeroConduce ?? ''}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {(modal?.tipo === 'nuevo' || modal?.tipo === 'editar') && (
        <ConduceModal
          conduce={modal.tipo === 'editar' ? modal.conduce : null}
          escuelas={escuelas} menu={menu} postres={postres}
          onClose={() => setModal(null)}
          busy={create.isPending || update.isPending}
          onSave={(d) => (modal.tipo === 'editar'
            ? update.mutate({ conduceId: modal.conduce.conduceId, data: d })
            : create.mutate(d))}
        />
      )}

      {modal?.tipo === 'jornada' && (
        <JornadaModal
          escuelas={escuelas}
          onClose={() => setModal(null)}
          busy={jornada.isPending}
          onSave={(d) => jornada.mutate(d)}
        />
      )}
    </div>
  );
}

function ConduceModal({ conduce, escuelas, menu, postres, onClose, busy, onSave }) {
  const { register, handleSubmit } = useForm({
    defaultValues: conduce
      ? { ...conduce, fecha: toDateInput(conduce.fecha), estado: String(conduce.estado ?? 0) }
      : { estado: '0', escuelaId: '', menuComidaId: '', postreId: '', numeroConduce: '' },
  });
  const numOrNull = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
  const submit = (d) => onSave({
    numeroConduce: numOrNull(d.numeroConduce),
    escuelaId: numOrNull(d.escuelaId),
    menuComidaId: numOrNull(d.menuComidaId),
    postreId: numOrNull(d.postreId),
    fecha: d.fecha || null,
    observaciones: d.observaciones || null,
    edicionReceta: d.edicionReceta || null,
    edicionPostre: d.edicionPostre || null,
    estado: Number(d.estado),
  });
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {conduce?.conduceId ? 'Editar conduce' : 'Nuevo conduce'}
          </h2>
          <button onClick={onClose} className="btn-ghost btn-icon">×</button>
        </div>
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label"># Conduce</label>
              <input type="number" min="1" className="input" {...register('numeroConduce')} />
            </div>
            <div>
              <label className="label">Fecha</label>
              <input type="date" className="input" {...register('fecha')} />
            </div>
          </div>
          <div>
            <label className="label">Escuela *</label>
            <select className="input" {...register('escuelaId', { required: true })}>
              <option value="">Seleccione...</option>
              {escuelas.map((e) => <option key={e.escuelaId} value={e.escuelaId}>{e.nombre}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Menú</label>
              <select className="input" {...register('menuComidaId')}>
                <option value="">Seleccione...</option>
                {menu.map((m) => <option key={m.menuComidaId} value={m.menuComidaId}>{m.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Postre</label>
              <select className="input" {...register('postreId')}>
                <option value="">Seleccione...</option>
                {postres.map((p) => <option key={p.postreId} value={p.postreId}>{p.nombre}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Estado</label>
            <select className="input" {...register('estado')}>
              <option value="0">No entrega</option>
              <option value="1">Entrega</option>
              <option value="2">Entregado</option>
            </select>
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

function JornadaModal({ escuelas, onClose, busy, onSave }) {
  const [fecha, setFecha] = useState(toDateInput(new Date().toISOString()));
  const [sinClase, setSinClase] = useState([]);
  const toggle = (id) => setSinClase((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Generar jornada</h2>
          <button onClick={onClose} className="btn-ghost btn-icon">×</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Fecha de la jornada</label>
            <input type="date" className="input" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <div>
            <label className="label">Escuelas sin clase (se omiten del recorrido)</label>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {escuelas.map((e) => (
                <label key={e.escuelaId} className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer" style={{ borderColor: 'var(--border)' }}>
                  <input type="checkbox" checked={sinClase.includes(e.escuelaId)} onChange={() => toggle(e.escuelaId)} />
                  <span className="text-sm">{e.nombre}</span>
                </label>
              ))}
              {escuelas.length === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No hay escuelas registradas.</p>}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button disabled={busy || !fecha} className="btn-primary flex-1" onClick={() => onSave({ fecha, escuelasSinClase: sinClase })}>
              {busy ? 'Generando...' : 'Generar jornada'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
