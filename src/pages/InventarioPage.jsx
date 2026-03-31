import React, { useState, useMemo } from 'react';
import { Plus, Search, Trash2, Box, CalendarDays, ListChecks, History } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useMovimientosInventario, useCreateMovimientoInventario, useDeleteMovimientoInventario, useHistorialProductoInventario } from '../hooks/useInventario';
import { useSearchProductos } from '../hooks/useFacturas';
import { fmt } from '../utils/format';

const TIPO_MOVIMIENTO = {
  0: 'Entrada',
  1: 'Salida',
  2: 'Ajuste',
};

export function InventarioPage() {
  const { user } = useAuthStore();

  const [filtroProducto, setFiltroProducto] = useState('');
  const [productoIdFilter, setProductoIdFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [modal, setModal] = useState(false);
  const [historialId, setHistorialId] = useState(null);
  const [form, setForm] = useState({ productoId: '', tipo: '', cantidad: '', nota: '' });

  const { data: movimientos = [], isLoading } = useMovimientosInventario({
    productoId: productoIdFilter || null,
    tipo: tipoFilter !== '' ? tipoFilter : null,
    fechaInicio: fechaInicio || null,
    fechaFin: fechaFin || null,
  });

  const { data: productos = [] } = useSearchProductos(filtroProducto);

  const { data: historialMovimientos = [] } = useHistorialProductoInventario(historialId, 50);

  const createMovimiento = useCreateMovimientoInventario(() => {
    setModal(false);
    setForm({ productoId: '', tipo: '', cantidad: '', nota: '' });
  });

  const deleteMovimiento = useDeleteMovimientoInventario();

  const productoNombre = useMemo(() => {
    if (!form.productoId) return '';
    const p = productos.find((x) => String(x.productoId) === String(form.productoId));
    return p ? p.descripcion : '';
  }, [form.productoId, productos]);

  const totalExistente = movimientos.reduce((s, m) => s + Number(m.cantidad || 0), 0);
  const totalEntradas = movimientos.filter((m) => Number(m.tipo) === 0).reduce((s, m) => s + Number(m.cantidad || 0), 0);
  const totalSalidas = movimientos.filter((m) => Number(m.tipo) === 1).reduce((s, m) => s + Number(m.cantidad || 0), 0);
  const totalAjustes = movimientos.filter((m) => Number(m.tipo) === 2).reduce((s, m) => s + Number(m.cantidad || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.productoId || form.tipo === '' || !form.cantidad) {
      alert('Selecciona producto, tipo y cantidad.');
      return;
    }

    if (!user?.usuarioId) {
      alert('Usuario no autenticado. Vuelve a iniciar sesión.');
      return;
    }

    const payload = {
      productoId: parseInt(form.productoId, 10),
      tipo: parseInt(form.tipo, 10),
      cantidad: parseFloat(form.cantidad),
      referencia: '',
      usuarioId: parseInt(user.usuarioId, 10),
      nota: form.nota || '',
    };

    createMovimiento.mutate(payload);
  };

  const list = movimientos;

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventario</h1>
          <p className="page-sub">{movimientos.length} movimientos</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary">
          <Plus size={15} /> Nuevo movimiento
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="card flex items-center gap-3">
          <Box size={18} className="text-brand" />
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Movimientos</p>
            <p className="text-xl font-bold">{movimientos.length}</p>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <ListChecks size={18} className="text-green-500" />
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Entradas</p>
            <p className="text-xl font-bold">{fmt(totalEntradas)}</p>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <ListChecks size={18} className="text-red-500" />
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Salidas</p>
            <p className="text-xl font-bold">{fmt(totalSalidas)}</p>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <ListChecks size={18} className="text-yellow-500" />
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Ajustes</p>
            <p className="text-xl font-bold">{fmt(totalAjustes)}</p>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <CalendarDays size={18} className="text-secondary" />
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Cantidad total</p>
            <p className="text-xl font-bold">{fmt(totalExistente)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label className="label">Producto</label>
          <input className="input" placeholder="Buscar producto..." value={filtroProducto} onChange={(e) => setFiltroProducto(e.target.value)} />
          {filtroProducto && productos.length > 0 && (
            <div className="card mt-1 p-2 max-h-40 overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
              {productos.map((p) => (
                <button
                  key={p.productoId}
                  className="w-full text-left py-1 text-sm hover:bg-[var(--bg-tertiary)]"
                  type="button"
                  onClick={() => {
                    setProductoIdFilter(p.productoId);
                    setFiltroProducto(`${p.descripcion}`);
                  }}
                >
                  {p.descripcion}
                </button>
              ))}
              <button
                type="button"
                className="text-xs text-blue-600"
                onClick={() => {
                  setProductoIdFilter('');
                  setFiltroProducto('');
                }}
              >Limpiar</button>
            </div>
          )}
        </div>

        <div>
          <label className="label">Tipo</label>
          <select className="input" value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)}>
            <option value="">Todos</option>
            <option value="0">Entrada</option>
            <option value="1">Salida</option>
            <option value="2">Ajuste</option>
          </select>
        </div>

        <div>
          <label className="label">Fecha inicio</label>
          <input className="input" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
        </div>

        <div>
          <label className="label">Fecha fin</label>
          <input className="input" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        </div>

        <div className="flex items-end">
          <button
            className="btn-secondary w-full"
            onClick={() => {
              setProductoIdFilter('');
              setTipoFilter('');
              setFechaInicio('');
              setFechaFin('');
              setFiltroProducto('');
            }}
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <div className="tbl-wrap">
        <table className="tbl table-fixed w-full">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th>Producto</th>
              <th>Tipo</th>
              <th>Fecha</th>
              <th>Cantidad</th>
              <th>Nota</th>
              <th className="w-28">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Cargando...</td></tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <Box size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-muted)' }}>No hay movimientos</p>
                </td>
              </tr>
            ) : list.map((m) => {
              const movimientoId = m.movimientoId || m.id;
              const nombreProducto = m.productoDescripcion || m.producto?.descripcion || 'Sin producto';
              return (
                <tr key={movimientoId ?? `${m.productoId}-${m.fecha}`}>
                  <td className="font-bold text-sm" style={{ color: 'var(--brand)' }}>#{movimientoId || '-'}</td>
                  <td className="font-medium text-sm truncate">{nombreProducto}</td>
                  <td><span className={`badge ${Number(m.tipo) === 0 ? 'badge-green' : Number(m.tipo) === 1 ? 'badge-red' : 'badge-yellow'}`}>{TIPO_MOVIMIENTO[m.tipo] || '—'}</span></td>
                  <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{m.fecha ? new Date(m.fecha).toLocaleDateString('es-DO') : '-'}</td>
                  <td className="text-sm text-right font-semibold tabular-nums">{fmt(m.cantidad)}</td>
                  <td className="text-sm truncate" style={{ maxWidth: '180px' }}>{m.nota || '—'}</td>
                  <td>
                    <div className="flex gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => setHistorialId(m.productoId)}
                        className="btn-ghost btn-icon btn-sm text-blue-500"
                        title="Historial por producto"
                      >
                        <History size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('¿Eliminar movimiento?')) deleteMovimiento.mutate(movimientoId);
                        }}
                        className="btn-ghost btn-icon btn-sm text-red-500"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Nuevo movimiento de inventario</h2>
              <button className="btn-ghost btn-icon" onClick={() => setModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="label">Producto</label>
                <input
                  value={form.productoId ? productoNombre : filtroProducto}
                  onChange={(e) => {
                    setFiltroProducto(e.target.value);
                    setForm({ ...form, productoId: '' });
                  }}
                  className="input"
                  placeholder="Buscar producto..."
                />
                {productos.length > 0 && filtroProducto && (
                  <div className="card mt-1 p-2 max-h-40 overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
                    {productos.map((p) => (
                      <button
                        key={p.productoId}
                        type="button"
                        className="w-full text-left py-1 text-sm hover:bg-[var(--bg-tertiary)]"
                        onClick={() => {
                          setForm({ ...form, productoId: p.productoId });
                          setFiltroProducto(p.descripcion);
                        }}
                      >
                        {p.descripcion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="label">Tipo</label>
                <select className="input" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                  <option value="">Selecciona</option>
                  <option value="0">Entrada</option>
                  <option value="1">Salida</option>
                  <option value="2">Ajuste</option>
                </select>
              </div>

              <div>
                <label className="label">Cantidad</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.cantidad}
                  onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Nota (opcional)</label>
                <input
                  className="input"
                  value={form.nota}
                  onChange={(e) => setForm({ ...form, nota: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={createMovimiento.isLoading}>
                  {createMovimiento.isLoading ? 'Guardando...' : 'Guardar movimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {historialId && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setHistorialId(null)}>
          <div className="modal-box max-w-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Historial del producto #{historialId}</h2>
              <button className="btn-ghost btn-icon" onClick={() => setHistorialId(null)}>×</button>
            </div>
            {historialMovimientos.length === 0 ? (
              <div className="text-center py-8">No hay historial</div>
            ) : (
              <div className="overflow-y-auto max-h-72">
                <table className="tbl w-full">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th>Cantidad</th>
                      <th>Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialMovimientos.map((mov) => (
                      <tr key={`${mov.movimientoId}-${mov.fecha}`}>
                        <td>{mov.fecha ? new Date(mov.fecha).toLocaleDateString('es-DO') : '-'}</td>
                        <td>{TIPO_MOVIMIENTO[mov.tipo]}</td>
                        <td className="text-right font-semibold">{fmt(mov.cantidad)}</td>
                        <td>{mov.nota || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
