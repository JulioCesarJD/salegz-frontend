import React, { useState, useMemo } from 'react';
import { Plus, Search, Trash2, Box, CalendarDays, ListChecks, History } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useMovimientosInventario, useCreateMovimientoInventario, useHistorialProductoInventario } from '../hooks/useInventario';
import { useSearchProductos } from '../hooks/useFacturas';
import { fmt } from '../utils/format';

const TIPO_MOVIMIENTO = {
  0: 'Entrada',
  1: 'Salida',
  2: 'Ajuste',
};

export function InventarioPage() {
  const { user } = useAuthStore();

  // ── Filtros de la tabla ──────────────────────────────────────────────────
  const [filtroProductoTabla, setFiltroProductoTabla] = useState('');   // FIX: estado separado
  const [productoIdFilter, setProductoIdFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // ── Modal nuevo movimiento ───────────────────────────────────────────────
  const [modal, setModal] = useState(false);
  const [filtroProductoModal, setFiltroProductoModal] = useState('');   // FIX: estado separado
  const [form, setForm] = useState({ productoId: '', tipo: '', cantidad: '', nota: '' });

  // ── Historial ────────────────────────────────────────────────────────────
  const [historialId, setHistorialId] = useState(null);

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: movimientos = [], isLoading } = useMovimientosInventario({
    productoId: productoIdFilter || null,
    tipo: tipoFilter !== '' ? tipoFilter : null,
    fechaInicio: fechaInicio || null,
    fechaFin: fechaFin || null,
  });

  // FIX: cada búsqueda usa su propio estado
  const { data: productosTabla = [] } = useSearchProductos(filtroProductoTabla);
  const { data: productosModal = [] } = useSearchProductos(filtroProductoModal);

  const { data: historialMovimientos = [] } = useHistorialProductoInventario(historialId, 50);

  const createMovimiento = useCreateMovimientoInventario(() => {
    setModal(false);
    setForm({ productoId: '', tipo: '', cantidad: '', nota: '' });
    setFiltroProductoModal('');
  });

  // ── Computed ─────────────────────────────────────────────────────────────
  const productoNombreModal = useMemo(() => {
    if (!form.productoId) return '';
    const p = productosModal.find((x) => String(x.productoId) === String(form.productoId));
    return p ? p.descripcion : '';
  }, [form.productoId, productosModal]);

  const productoSeleccionado = useMemo(
    () => productosModal.find((p) => String(p.productoId) === String(form.productoId)),
    [productosModal, form.productoId],
  );

  const stockActual = useMemo(() => Number(productoSeleccionado?.cantidad || 0), [productoSeleccionado]);

  const totalEntradas = movimientos.filter((m) => Number(m.tipo) === 0).reduce((s, m) => s + Number(m.cantidad || 0), 0);
  const totalSalidas  = movimientos.filter((m) => Number(m.tipo) === 1).reduce((s, m) => s + Number(m.cantidad || 0), 0);
  const totalAjustes  = movimientos.filter((m) => Number(m.tipo) === 2).reduce((s, m) => s + Number(m.cantidad || 0), 0);
  const totalExistente = movimientos.length > 0 ? movimientos[0].stockActual : 0;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.productoId || form.tipo === '' || !form.cantidad) {
      alert('Selecciona producto, tipo y cantidad.');
      return;
    }

    if (Number(form.tipo) === 1 && Number(form.cantidad) > stockActual) {
      alert(`Stock insuficiente. Disponible: ${stockActual}`);
      return;
    }

    createMovimiento.mutate({
      productoId: parseInt(form.productoId, 10),
      tipo: parseInt(form.tipo, 10),
      cantidad: parseFloat(form.cantidad),
      referencia: '',
      nota: form.nota || '',
    });
  };

  const limpiarFiltros = () => {
    setProductoIdFilter('');
    setTipoFilter('');
    setFechaInicio('');
    setFechaFin('');
    setFiltroProductoTabla('');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventario</h1>
          <p className="page-sub">{movimientos.length} movimientos</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary">
          <Plus size={15} /> Nuevo movimiento
        </button>
      </div>

      {/* Cards resumen */}
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

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label className="label">Producto</label>
          <input
            className="input"
            placeholder="Buscar producto..."
            value={filtroProductoTabla}
            onChange={(e) => {
              setFiltroProductoTabla(e.target.value);
              if (!e.target.value) setProductoIdFilter('');
            }}
          />
          {/* FIX: usa productosTabla, no productosModal */}
          {filtroProductoTabla && productosTabla.length > 0 && (
            <div className="card mt-1 p-2 max-h-40 overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
              {productosTabla.map((p) => (
                <button
                  key={p.productoId}
                  className="w-full text-left py-1 text-sm hover:bg-[var(--bg-tertiary)]"
                  type="button"
                  onClick={() => {
                    setProductoIdFilter(p.productoId);
                    setFiltroProductoTabla(p.descripcion);
                  }}
                >
                  {p.descripcion}
                </button>
              ))}
              <button
                type="button"
                className="text-xs text-blue-600"
                onClick={() => { setProductoIdFilter(''); setFiltroProductoTabla(''); }}
              >
                Limpiar
              </button>
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
          <button className="btn-secondary w-full" onClick={limpiarFiltros}>
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Tabla — FIX: un solo tbody, sin map duplicado */}
      <div className="tbl-wrap">
        <table className="tbl table-fixed w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Producto</th>
              <th>Tipo</th>
              <th>Fecha</th>
              <th className="text-right">Cantidad</th>
              <th className="text-right">Stk. Anterior</th>
              <th className="text-right">Stk. Actual</th>
              <th>Nota</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                  Cargando...
                </td>
              </tr>
            ) : movimientos.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12">
                  <Box size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-muted)' }}>No hay movimientos</p>
                </td>
              </tr>
            ) : (
              movimientos.map((m) => {
                const movimientoId = m.movimientoId || m.id;
                return (
                  <tr key={movimientoId}>
                    <td className="font-bold text-sm" style={{ color: 'var(--brand)' }}>
                      #{movimientoId}
                    </td>
                    <td className="font-medium text-sm truncate">
                      {m.productoDescripcion || 'Sin producto'}
                    </td>
                    <td>
                      <span className={`badge ${
                        Number(m.tipo) === 0 ? 'badge-green' :
                        Number(m.tipo) === 1 ? 'badge-red' : 'badge-yellow'
                      }`}>
                        {TIPO_MOVIMIENTO[m.tipo] || '—'}
                      </span>
                    </td>
                    <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {m.fecha ? new Date(m.fecha).toLocaleDateString('es-DO') : '-'}
                    </td>
                    <td className="text-start font-semibold tabular-nums">
                      {fmt(m.cantidad)}
                    </td>
                    <td className="text-start text-xs tabular-nums">
                      {fmt(m.stockAnterior)}
                    </td>
                    <td className="text-start font-bold tabular-nums">
                      {fmt(m.stockActual)}
                    </td>
                    <td className="text-sm truncate">{m.nota || '—'}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setHistorialId(m.productoId)}
                        className="btn-ghost btn-icon btn-sm text-blue-500"
                        title="Historial por producto"
                      >
                        <History size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal nuevo movimiento */}
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
                {/* FIX: usa filtroProductoModal y productosModal */}
                <input
                  value={form.productoId ? productoNombreModal : filtroProductoModal}
                  onChange={(e) => {
                    setFiltroProductoModal(e.target.value);
                    setForm({ ...form, productoId: '' });
                  }}
                  className="input"
                  placeholder="Buscar producto..."
                />
                {productosModal.length > 0 && filtroProductoModal && !form.productoId && (
                  <div className="card mt-1 p-2 max-h-40 overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
                    {productosModal.map((p) => (
                      <button
                        key={p.productoId}
                        type="button"
                        className="w-full text-left py-1 text-sm hover:bg-[var(--bg-tertiary)]"
                        onClick={() => {
                          setForm({ ...form, productoId: p.productoId });
                          setFiltroProductoModal(p.descripcion);
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
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Stock actual: <b>{fmt(stockActual)}</b>
                </div>
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
                <button type="button" className="btn-secondary" onClick={() => setModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={createMovimiento.isLoading}>
                  {createMovimiento.isLoading ? 'Guardando...' : 'Guardar movimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal historial */}
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
                      <th className="text-right">Cantidad</th>
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