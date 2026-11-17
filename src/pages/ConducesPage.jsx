import React, { Fragment, useState } from 'react';
import { Plus, Search, Edit2, Shield, Trash2, CalendarCheck, BusFront, ChevronDown, ChevronRight } from 'lucide-react';
import { usePermiso } from '../hooks/usePermiso';
import { P } from '../store/permisosStore';
import { useConduces, useCreateConduce, useUpdateConduce, useDeleteConduce, useGenerarJornada } from '../hooks/useConduces';
import { useEscuelas } from '../hooks/useEscuelas';
import { useMenuComida } from '../hooks/useMenuComida';
import { usePostres } from '../hooks/usePostres';
import { useRecetas } from '../hooks/useRecetas';
import { ESTADOS_CONDUCE, estadoConduceBadge, estadoConduceLabel } from '../models/conduces';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ConduceModal } from '../components/features/cocina/ConduceModal';
import { JornadaModal } from '../components/features/cocina/JornadaModal';
import { fmt } from '../utils/format';

const fmtFecha = (value) => (value ? new Date(value).toLocaleDateString('es-DO') : '—');

export function ConducesPage() {
  const { puedeVer, tienePermiso } = usePermiso();
  const puedeAcceder = puedeVer(P.Conduces.Ver);
  const puedeCrear = tienePermiso(P.Conduces.Crear);
  const puedeEditar = tienePermiso(P.Conduces.Editar);
  const puedeEliminar = tienePermiso(P.Conduces.Eliminar);
  const puedeGenerar = tienePermiso(P.Conduces.GenerarJornada);
  const puedeVerRecetas = puedeVer(P.Recetas.Ver);

  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expandido, setExpandido] = useState(null);

  const { data: conduces = [], isLoading } = useConduces({ pageSize: 200 }, { enabled: puedeAcceder });
  const { data: escuelas = [] } = useEscuelas(
    { pageSize: 200 },
    { enabled: puedeAcceder && puedeVer(P.Escuelas.Ver) }
  );
  const { data: menu = [] } = useMenuComida(
    { pageSize: 200 },
    { enabled: puedeAcceder && puedeVer(P.MenuComida.Ver) }
  );
  const { data: postres = [] } = usePostres(
    { pageSize: 200 },
    { enabled: puedeAcceder && puedeVer(P.Postres.Ver) }
  );
  const { data: recetas = [] } = useRecetas(
    { pageSize: 200 },
    { enabled: puedeAcceder && puedeVerRecetas }
  );

  const create = useCreateConduce(() => setModal(null));
  const update = useUpdateConduce(() => setModal(null));
  const remove = useDeleteConduce();
  const jornada = useGenerarJornada(() => setModal(null));

  if (!puedeAcceder) {
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
    const matchQ = !q ||
      String(c.numeroConduce ?? '').includes(q) ||
      (c.escuelaNombre || '').toLowerCase().includes(q) ||
      (c.menuComidaNombre || '').toLowerCase().includes(q) ||
      (c.postreNombre || '').toLowerCase().includes(q) ||
      (c.servicio || '').toLowerCase().includes(q);
    const matchEstado = filtroEstado === '' || Number(c.estado) === Number(filtroEstado);
    return matchQ && matchEstado;
  });

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Conduces</h1>
          <p className="page-sub">{conduces.length} conduces registrados</p>
        </div>
        <div className="flex gap-2">
          {puedeGenerar && (
            <button onClick={() => setModal({ tipo: 'jornada' })} className="btn-secondary">
              <CalendarCheck size={15} /> Generar jornada
            </button>
          )}
          {puedeCrear && (
            <button onClick={() => setModal({ tipo: 'nuevo' })} className="btn-primary">
              <Plus size={15} /> Nuevo conduce
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            className="input pl-8"
            placeholder="Buscar # conduce, escuela, menú, postre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-44"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS_CONDUCE).map(([value, info]) => (
            <option key={value} value={value}>{info.label}</option>
          ))}
        </select>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th className="w-8"></th>
              <th>#</th>
              <th>Escuela</th>
              <th>Menú</th>
              <th>Postre</th>
              <th>Fecha</th>
              <th>Servicio</th>
              <th className="text-right">Porciones</th>
              <th className="text-right">Monto</th>
              <th>Estado</th>
              <th className="w-24"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={11} className="text-center py-10">Cargando...</td></tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-12">
                  <Shield size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-muted)' }}>No hay conduces registrados</p>
                </td>
              </tr>
            ) : list.map((c) => {
              const abierto = expandido === c.conduceId;
              const detalles = c.detalles ?? [];
              return (
                <Fragment key={c.conduceId}>
                  <tr>
                    <td>
                      <button
                        type="button"
                        onClick={() => setExpandido(abierto ? null : c.conduceId)}
                        className="btn-ghost btn-icon btn-sm"
                        title={abierto ? 'Ocultar detalles' : 'Ver detalles'}
                      >
                        {abierto ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </td>
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
                    <td className="text-sm">{fmtFecha(c.fecha)}</td>
                    <td className="text-sm">{c.servicio || '—'}</td>
                    <td className="text-right text-sm tabular-nums">{c.porciones ?? 0}</td>
                    <td className="text-right font-semibold text-sm tabular-nums">{fmt(c.monto)}</td>
                    <td>
                      <span className={estadoConduceBadge(c.estado)}>{estadoConduceLabel(c.estado)}</span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        {puedeEditar && (
                          <button onClick={() => setModal({ tipo: 'editar', conduce: c })} className="btn-ghost btn-icon btn-sm" title="Editar"><Edit2 size={14} /></button>
                        )}
                        {puedeEliminar && (
                          <button onClick={() => setDeleteTarget(c)} className="btn-ghost btn-icon btn-sm text-red-500" title="Eliminar"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {abierto && (
                    <tr>
                      <td colSpan={11} style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        {detalles.length === 0 ? (
                          <p className="text-sm py-2" style={{ color: 'var(--text-muted)' }}>
                            Este conduce no tiene recetas detalladas.
                          </p>
                        ) : (
                          <div className="py-2 space-y-2">
                            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                              Detalles del conduce {c.numeroConduce ?? ''} · Usuario: {c.usuarioNombre || '—'}
                            </p>
                            <table className="tbl">
                              <thead>
                                <tr>
                                  <th>Receta</th>
                                  <th className="text-right">Porciones</th>
                                  <th className="text-right">Precio unit.</th>
                                  <th className="text-right">Costo unit.</th>
                                  <th className="text-right">Subtotal</th>
                                  <th>Observaciones</th>
                                </tr>
                              </thead>
                              <tbody>
                                {detalles.map((d) => (
                                  <tr key={d.conduceDetalleId}>
                                    <td className="text-sm">{d.recetaNombre || '—'}</td>
                                    <td className="text-right text-sm tabular-nums">{d.porciones}</td>
                                    <td className="text-right text-sm tabular-nums">{fmt(d.precioUnitario)}</td>
                                    <td className="text-right text-sm tabular-nums">{fmt(d.costoUnitario)}</td>
                                    <td className="text-right text-sm tabular-nums font-semibold">{fmt(d.subTotal)}</td>
                                    <td className="text-sm">{d.observaciones || '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
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
          escuelas={escuelas}
          menu={menu}
          postres={postres}
          recetas={recetas}
          puedeEditarDetalles={puedeVerRecetas}
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
          menu={menu}
          postres={postres}
          onClose={() => setModal(null)}
          busy={jornada.isPending}
          onSave={(d) => jornada.mutate(d)}
        />
      )}
    </div>
  );
}
