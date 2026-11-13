import { useState } from 'react';
import { Plus, XCircle, Trash2 } from 'lucide-react';
import { useNotasCredito, useCreateNotaCredito } from '../hooks/useNotasCredito';
import { useFacturas, useSearchProductos } from '../hooks/useFacturas';
import toast from 'react-hot-toast';

const fmt = (v) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v || 0);
const RAZONES = ['Devolución de mercancía', 'Descuento', 'Anulación de factura', 'Ajuste de precio', 'Otros'];

export function NotasCreditoPage() {
  const [modal, setModal] = useState(null);
  const [searchFac, setSearchFac] = useState('');
  const [productoSearch, setProductoSearch] = useState('');
  const [form, setForm] = useState(null);

  const { data: notas = [], isLoading } = useNotasCredito({ pageSize: 1000 });
  const { data: facturas = [] } = useFacturas('', '', '', '', '');
  const { data: productos = [] } = useSearchProductos(productoSearch);
  const createNC = useCreateNotaCredito(() => { setModal(null); setForm(null); setSearchFac(''); setProductoSearch(''); });

  const montoTotalNC = notas.reduce((s, n) => s + (n.total || 0), 0);
  const facturasFiltradas = (facturas || []).filter((f) => (f.estado ?? 1) !== 0);

  const abrirNueva = () => {
    setForm({ facturaId: '', razon: RAZONES[0], detalles: [] });
    setModal('nueva');
    setSearchFac('');
    setProductoSearch('');
  };

  const agregarProducto = (p) => {
    setForm((prev) => {
      if (!prev) return prev;
      const idx = prev.detalles.findIndex((d) => d.productoId === p.productoId);
      if (idx >= 0) {
        const copy = [...prev.detalles];
        copy[idx] = { ...copy[idx], cantidad: (copy[idx].cantidad || 0) + 1 };
        return { ...prev, detalles: copy };
      }
      return { ...prev, detalles: [...prev.detalles, { productoId: p.productoId, descripcion: p.descripcion, cantidad: 1 }] };
    });
    setProductoSearch('');
  };

  const cambiarCantidad = (idx, val) => {
    setForm((prev) => {
      if (!prev) return prev;
      const copy = [...prev.detalles];
      copy[idx] = { ...copy[idx], cantidad: val };
      return { ...prev, detalles: copy };
    });
  };

  const quitarDetalle = (idx) => {
    setForm((prev) => (prev ? { ...prev, detalles: prev.detalles.filter((_, i) => i !== idx) } : prev));
  };

  const handleSubmit = () => {
    if (!form?.facturaId) return toast.error('Seleccione una factura');
    if (!form.detalles?.length) return toast.error('Agregue al menos un producto');
    if (form.detalles.some((d) => !(parseFloat(d.cantidad) > 0))) return toast.error('Cada detalle debe tener cantidad mayor a cero');
    createNC.mutate({
      facturaId: parseInt(form.facturaId),
      razonModificacion: form.razon,
      detalles: form.detalles.map((d) => ({ productoId: d.productoId, cantidad: parseFloat(d.cantidad) })),
    });
  };

  const cerrar = () => { setModal(null); setForm(null); setSearchFac(''); setProductoSearch(''); };

  return (
    <div className="space-y-4 sm:space-y-5 px-4 sm:px-0 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Notas de Crédito</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{notas.length} registros</p>
        </div>
        <button onClick={abrirNueva} className="btn-primary w-full sm:w-auto"><Plus size={15} /> Nueva Nota de Crédito</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          ['Total', notas.length, 'var(--text-primary)'],
          ['Emitidas', notas.length, '#22c55e'],
          ['Monto NC', fmt(montoTotalNC), '#f59e0b'],
        ].map(([l, v, color]) => (
          <div key={l} className="card text-center py-3">
            <p className="text-lg sm:text-xl font-extrabold" style={{ color }}>{v}</p>
            <p className="text-[10px] sm:text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{l}</p>
          </div>
        ))}
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr>
            <th>#</th><th>Comprobante</th><th>Factura</th><th>Total</th><th>ITBIS</th><th>Razón</th><th>Estado</th><th>Fecha</th>
          </tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan="8" className="text-center py-8">Cargando...</td></tr> :
              notas.length === 0 ? <tr><td colSpan="8" className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Sin notas de crédito</td></tr> :
              notas.map((n) => (
                <tr key={n.notaCreditoId}>
                  <td className="font-medium">#{n.notaCreditoId}</td>
                  <td className="text-sm">{n.comprobante || '—'}</td>
                  <td>#{n.facturaId}</td>
                  <td className="font-semibold">{fmt(n.total)}</td>
                  <td className="text-sm">{fmt(n.itbis)}</td>
                  <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{n.razonModificacion || '—'}</td>
                  <td><span className="badge-green">{n.estadoComprobante || 'Emitida'}</span></td>
                  <td>{n.fecha ? new Date(n.fecha).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modal === 'nueva' && form && (
        <div className="modal-overlay" onClick={cerrar}>
          <div className="modal-box max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Nueva Nota de Crédito</h2>
              <button onClick={cerrar} className="btn-icon"><XCircle size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Factura</label>
                <input type="text" className="input" placeholder="Buscar factura #..." value={searchFac} onChange={e => setSearchFac(e.target.value)} />
                {searchFac.length > 0 && facturasFiltradas.length > 0 && (
                  <div className="mt-1 rounded-lg border shadow-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    {facturasFiltradas.filter(f => String(f.facturaId).includes(searchFac) || (f.nombreCliente || '').toLowerCase().includes(searchFac.toLowerCase())).slice(0, 5).map(f => (
                      <button key={f.facturaId} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-tertiary)]"
                        onClick={() => { setForm((p) => ({ ...p, facturaId: f.facturaId })); setSearchFac(`#${f.facturaId} - ${f.nombreCliente}`); }}>
                        #{f.facturaId} — {f.nombreCliente} — {fmt(f.total)}
                      </button>
                    ))}
                  </div>
                )}
                {form.facturaId && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Factura seleccionada: #{form.facturaId}</p>}
              </div>

              <div>
                <label className="label">Razón de modificación (nota de lo que es la nota de crédito)</label>
                <select className="input" value={form.razon} onChange={e => setForm((p) => ({ ...p, razon: e.target.value }))}>
                  {RAZONES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Agregar productos</label>
                <input type="text" className="input" placeholder="Buscar producto..." value={productoSearch} onChange={e => setProductoSearch(e.target.value)} />
                {productos.length > 0 && (
                  <div className="mt-1 rounded-lg border shadow-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    {productos.map((p) => (
                      <button key={p.productoId} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-tertiary)]"
                        onClick={() => agregarProducto(p)}>
                        {p.descripcion} — {fmt(p.precio1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {form.detalles.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Agregue al menos un producto.</p>
                ) : form.detalles.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-tertiary)' }}>
                    <span className="flex-1 text-sm font-medium">{d.descripcion}</span>
                    <input type="number" min="0" step="0.01" className="input w-24 text-right py-1"
                      value={d.cantidad} onChange={(e) => cambiarCantidad(i, e.target.value)} />
                    <button type="button" onClick={() => quitarDetalle(i)} className="btn-ghost btn-icon btn-sm text-red-500"><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>

              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                El servidor calcula Total/ITBIS y reduce la factura original. No se puede acreditar más de lo facturado.
              </p>

              <div className="flex gap-2 pt-2">
                <button onClick={handleSubmit} className="btn-primary flex-1" disabled={createNC.isPending}>
                  {createNC.isPending ? 'Creando...' : 'Crear Nota de Crédito'}
                </button>
                <button onClick={cerrar} className="btn-secondary">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
