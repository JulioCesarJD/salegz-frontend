import { useState } from 'react';
import { Plus, XCircle, FileText } from 'lucide-react';
import { useNotasCredito, useCreateNotaCredito, useCancelarNotaCredito } from '../hooks/useNotasCredito';
import { useFacturas } from '../hooks/useFacturas';
import { usePermiso } from '../hooks/usePermiso';
import toast from 'react-hot-toast';

const fmt = (v) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v || 0);
const RAZONES = ['Devolución de mercancía', 'Descuento', 'Anulación de factura', 'Ajuste de precio', 'Otros'];

export function NotasCreditoPage() {
  const { puedeVer } = usePermiso();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ facturaId: '', ncf: '', razon: RAZONES[0], monto: '', detalles: [] });
  const [searchFac, setSearchFac] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const { data: notas = [], isLoading } = useNotasCredito();
  const { data: facturas = [] } = useFacturas('', '', '', '', '');
  const createNC = useCreateNotaCredito(() => { setModal(null); setForm({ facturaId: '', ncf: '', razon: RAZONES[0], monto: '', detalles: [] }); setSearchFac(''); });
  const cancelNC = useCancelarNotaCredito();

  const activas = notas.filter(n => n.estado !== 0);
  const canceladas = notas.filter(n => n.estado === 0);
  const montoTotalNC = activas.reduce((s, n) => s + (n.monto || n.total || 0), 0);

  const facturasFiltradas = facturas.filter(f => f.estado !== 0);

  function handleSubmit() {
    if (!form.facturaId) return toast.error('Seleccione una factura');
    if (!form.monto || parseFloat(form.monto) <= 0) return toast.error('Ingrese un monto válido');
    createNC.mutate({
      facturaId: parseInt(form.facturaId),
      ncf: form.ncf,
      razonModificacion: form.razon,
      monto: parseFloat(form.monto),
      detalles: form.detalles,
    });
  }

  return (
    <div className="space-y-4 sm:space-y-5 px-4 sm:px-0 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Notas de Crédito</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{notas.length} registros</p>
        </div>
        <button onClick={() => setModal('nueva')} className="btn-primary w-full sm:w-auto"><Plus size={15} /> Nueva Nota de Crédito</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Total', notas.length, 'var(--text-primary)'],
          ['Activas', activas.length, '#22c55e'],
          ['Canceladas', canceladas.length, '#ef4444'],
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
            <th>#</th><th>Factura</th><th>Cliente</th><th>Monto</th><th>Razón</th><th>Estado</th><th>Fecha</th><th className="text-right">Acción</th>
          </tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan="8" className="text-center py-8">Cargando...</td></tr> :
              notas.length === 0 ? <tr><td colSpan="8" className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Sin notas de crédito</td></tr> :
              notas.map(n => (
                <tr key={n.notaCreditoId}>
                  <td className="font-medium">#{n.notaCreditoId}</td>
                  <td>#{n.facturaId}</td>
                  <td>{n.nombreCliente || '—'}</td>
                  <td className="font-semibold">{fmt(n.monto || n.total)}</td>
                  <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{n.razonModificacion}</td>
                  <td><span className={`badge-${n.estado === 0 ? 'red' : 'green'}`}>{n.estado === 0 ? 'Cancelada' : 'Activa'}</span></td>
                  <td>{n.fecha ? new Date(n.fecha).toLocaleDateString() : '—'}</td>
                  <td className="text-right">
                    {n.estado !== 0 && <button onClick={() => cancelNC.mutate(n.notaCreditoId)} className="btn-sm btn-ghost text-red-500"><XCircle size={14} /></button>}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modal === 'nueva' && (
        <div className="modal-overlay" onClick={() => { setModal(null); setForm({ facturaId: '', ncf: '', razon: RAZONES[0], monto: '', detalles: [] }); setSearchFac(''); }}>
          <div className="modal-box max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Nueva Nota de Crédito</h2>
              <button onClick={() => { setModal(null); setForm({ facturaId: '', ncf: '', razon: RAZONES[0], monto: '', detalles: [] }); setSearchFac(''); }} className="btn-icon"><XCircle size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Factura</label>
                <input type="text" className="input" placeholder="Buscar factura #..." value={searchFac} onChange={e => setSearchFac(e.target.value)} />
                {searchFac.length > 0 && facturasFiltradas.length > 0 && (
                  <div className="mt-1 rounded-lg border shadow-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    {facturasFiltradas.filter(f => String(f.facturaId).includes(searchFac) || (f.nombreCliente || '').toLowerCase().includes(searchFac.toLowerCase())).slice(0, 5).map(f => (
                      <button key={f.facturaId} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-tertiary)]"
                        onClick={() => { setForm(prev => ({ ...prev, facturaId: f.facturaId, monto: f.total })); setSearchFac(`#${f.facturaId} - ${f.nombreCliente}`); }}>
                        #{f.facturaId} — {f.nombreCliente} — {fmt(f.total)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="label">NCF (opcional)</label>
                <input type="text" className="input" value={form.ncf} onChange={e => setForm(p => ({ ...p, ncf: e.target.value }))} />
              </div>
              <div>
                <label className="label">Razón de modificación</label>
                <select className="input" value={form.razon} onChange={e => setForm(p => ({ ...p, razon: e.target.value }))}>
                  {RAZONES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Monto</label>
                <input type="number" step="0.01" className="input" value={form.monto} onChange={e => setForm(p => ({ ...p, monto: e.target.value }))} />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleSubmit} className="btn-primary flex-1" disabled={createNC.isPending}>
                  {createNC.isPending ? 'Creando...' : 'Crear Nota de Crédito'}
                </button>
                <button onClick={() => { setModal(null); setForm({ facturaId: '', ncf: '', razon: RAZONES[0], monto: '', detalles: [] }); setSearchFac(''); }} className="btn-secondary">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
