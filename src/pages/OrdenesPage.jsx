import { useState } from 'react';
import { Plus, CheckCircle, XCircle, FileText, Trash2 } from 'lucide-react';
import { useOrdenes, useCreateOrden, useProcesarOrden, useCancelarOrden, useConvertirOrdenAFactura } from '../hooks/useOrdenes';
import { useSearchClientes } from '../hooks/useFacturas';
import { useSearchProductos } from '../hooks/useFacturas';
import { usePermiso } from '../hooks/usePermiso';
import toast from 'react-hot-toast';

const fmt = (v) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v || 0);
const ESTADO_ORDEN = ['Pendiente', 'Procesada', 'Cancelada', 'Convertida'];
const ESTADO_COLORS = { 0: 'yellow', 1: 'green', 2: 'red', 3: 'blue' };

export function OrdenesPage() {
  const { puedeVer } = usePermiso();
  const [filtro, setFiltro] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ clienteId: '', nombreCliente: '', telefono: '', direccion: '', notas: '', detalles: [] });
  const [searchCli, setSearchCli] = useState('');
  const [searchProd, setSearchProd] = useState('');

  const { data: ordenes = [], isLoading } = useOrdenes(filtro);
  const createOrden = useCreateOrden(() => cerrarModal());
  const procesar = useProcesarOrden();
  const cancelar = useCancelarOrden();
  const convertir = useConvertirOrdenAFactura();
  const { data: clientes = [] } = useSearchClientes(searchCli);
  const { data: productos = [] } = useSearchProductos(searchProd);

  const pendientes = ordenes.filter(o => o.estado === 0);
  const procesadas = ordenes.filter(o => o.estado === 1);

  function cerrarModal() {
    setModal(null);
    setForm({ clienteId: '', nombreCliente: '', telefono: '', direccion: '', notas: '', detalles: [] });
    setSearchCli('');
    setSearchProd('');
  }

  function addDetalle(prod) {
    setForm(f => ({ ...f, detalles: [...f.detalles, { productoId: prod.productoId, descripcion: prod.descripcion, cantidad: 1, precio: prod.precio1 || 0 }] }));
    setSearchProd('');
  }

  function updDetalle(idx, field, val) {
    setForm(f => {
      const d = [...f.detalles];
      d[idx] = { ...d[idx], [field]: val };
      return { ...f, detalles: d };
    });
  }

  function removeDetalle(idx) {
    setForm(f => ({ ...f, detalles: f.detalles.filter((_, i) => i !== idx) }));
  }

  const totalOrden = form.detalles.reduce((s, d) => s + (d.cantidad || 0) * (d.precio || 0), 0);

  function handleSubmit() {
    if (!form.clienteId) return toast.error('Seleccione un cliente');
    if (form.detalles.length === 0) return toast.error('Agregue al menos un producto');
    createOrden.mutate({
      clienteId: parseInt(form.clienteId),
      nombreCliente: form.nombreCliente,
      telefonoCliente: form.telefono,
      direccionCliente: form.direccion,
      notas: form.notas,
      detalles: form.detalles.map(d => ({ productoId: d.productoId, cantidad: parseFloat(d.cantidad), precio: parseFloat(d.precio) })),
    });
  }

  return (
    <div className="space-y-4 sm:space-y-5 px-4 sm:px-0 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Órdenes</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{ordenes.length} órdenes</p>
        </div>
        <button onClick={() => setModal('nueva')} className="btn-primary w-full sm:w-auto"><Plus size={15} /> Nueva Orden</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Total', ordenes.length, 'var(--text-primary)'],
          ['Procesadas', procesadas.length, '#22c55e'],
          ['Pendientes', pendientes.length, '#f59e0b'],
          ['Canceladas', ordenes.filter(o => o.estado === 2).length, '#ef4444'],
        ].map(([l, v, color]) => (
          <div key={l} className="card text-center py-3">
            <p className="text-lg sm:text-xl font-extrabold" style={{ color }}>{v}</p>
            <p className="text-[10px] sm:text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{l}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {[['Todos', ''], ['Pendiente', '0'], ['Procesada', '1'], ['Cancelada', '2'], ['Convertida', '3']].map(([l, v]) => (
          <button key={v} onClick={() => setFiltro(v)} className={`btn-sm rounded-lg ${filtro === v ? 'btn-primary' : 'btn-secondary'}`}>{l}</button>
        ))}
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr>
            <th>#</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th className="text-right">Acciones</th>
          </tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan="6" className="text-center py-8">Cargando...</td></tr> :
              ordenes.length === 0 ? <tr><td colSpan="6" className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Sin órdenes</td></tr> :
              ordenes.map(o => (
                <tr key={o.ordenId}>
                  <td className="font-medium">#{o.ordenId}</td>
                  <td>{o.nombreCliente || '—'}</td>
                  <td>{o.fecha ? new Date(o.fecha).toLocaleDateString() : '—'}</td>
                  <td>{fmt(o.total)}</td>
                  <td><span className={`badge-${ESTADO_COLORS[o.estado] || 'gray'}`}>{ESTADO_ORDEN[o.estado] || '—'}</span></td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      {o.estado === 0 && <button onClick={() => procesar.mutate(o.ordenId)} className="btn-sm btn-ghost text-green-500" title="Procesar"><CheckCircle size={14} /></button>}
                      {o.estado === 0 && <button onClick={() => cancelar.mutate(o.ordenId)} className="btn-sm btn-ghost text-red-500" title="Cancelar"><XCircle size={14} /></button>}
                      {o.estado === 1 && <button onClick={() => convertir.mutate(o.ordenId)} className="btn-sm btn-ghost text-blue-500" title="Convertir a factura"><FileText size={14} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modal === 'nueva' && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-box max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Nueva Orden</h2>
              <button onClick={cerrarModal} className="btn-icon"><XCircle size={18} /></button>
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Cliente</label>
                  <input type="text" className="input" placeholder="Buscar cliente..." value={searchCli} onChange={e => { setSearchCli(e.target.value); setForm(f => ({ ...f, clienteId: '', nombreCliente: e.target.value })); }} />
                  {searchCli.length >= 2 && clientes.length > 0 && (
                    <div className="absolute z-10 mt-1 w-72 rounded-lg border shadow-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                      {clientes.slice(0, 5).map(c => (
                        <button key={c.clienteId} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-tertiary)]"
                          onClick={() => { setForm(f => ({ ...f, clienteId: c.clienteId, nombreCliente: c.nombre })); setSearchCli(c.nombre); }}>
                          {c.nombre} — {c.identificacion || ''}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="label">Teléfono</label>
                  <input type="text" className="input" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Dirección</label>
                <input type="text" className="input" value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} />
              </div>

              <div>
                <label className="label">Productos</label>
                <input type="text" className="input mb-2" placeholder="Buscar producto..." value={searchProd} onChange={e => setSearchProd(e.target.value)} />
                {searchProd.length >= 1 && productos.length > 0 && (
                  <div className="mb-2 rounded-lg border shadow-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    {productos.slice(0, 5).map(p => (
                      <button key={p.productoId} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-tertiary)] flex justify-between"
                        onClick={() => addDetalle(p)}>
                        <span>{p.descripcion}</span><span style={{ color: 'var(--text-muted)' }}>{fmt(p.precio1)}</span>
                      </button>
                    ))}
                  </div>
                )}
                {form.detalles.length > 0 && (
                  <div className="tbl-wrap">
                    <table className="tbl">
                      <thead><tr><th>Producto</th><th className="w-20">Cant</th><th className="w-24">Precio</th><th className="w-24">Subtotal</th><th className="w-10"></th></tr></thead>
                      <tbody>
                        {form.detalles.map((d, i) => (
                          <tr key={i}>
                            <td>{d.descripcion}</td>
                            <td><input type="number" className="input w-20 text-sm" value={d.cantidad} onChange={e => updDetalle(i, 'cantidad', e.target.value)} min="0.01" step="0.01" /></td>
                            <td><input type="number" className="input w-24 text-sm" value={d.precio} onChange={e => updDetalle(i, 'precio', e.target.value)} min="0" step="0.01" /></td>
                            <td className="font-semibold">{fmt((d.cantidad || 0) * (d.precio || 0))}</td>
                            <td><button onClick={() => removeDetalle(i)} className="btn-icon text-red-500"><Trash2 size={14} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <p className="text-right font-bold text-lg mt-2" style={{ color: 'var(--text-primary)' }}>Total: {fmt(totalOrden)}</p>
              </div>
              <div>
                <label className="label">Notas</label>
                <textarea className="input" rows={2} value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleSubmit} className="btn-primary flex-1" disabled={createOrden.isPending}>
                  {createOrden.isPending ? 'Creando...' : 'Crear Orden'}
                </button>
                <button onClick={cerrarModal} className="btn-secondary">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
