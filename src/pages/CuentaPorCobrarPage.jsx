import { useState } from 'react';
import { DollarSign, Search } from 'lucide-react';
import { useCuentasCobrar, useAplicarAbono, useAbonosByFactura } from '../hooks/useCuentasCobrar';
import { usePermiso } from '../hooks/usePermiso';
import toast from 'react-hot-toast';

const fmt = (v) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v || 0);
const ESTADOS = ['Cancelada', 'Activa', 'Saldada', 'Cuenta Abierta'];

export function CuentaPorCobrarPage() {
  const { puedeVer } = usePermiso();
  const [filtro, setFiltro] = useState('');
  const [modalAbono, setModalAbono] = useState(null);
  const [formAbono, setFormAbono] = useState({ monto: '', fecha: new Date().toISOString().split('T')[0], metodoPago: 'Efectivo', referencia: '' });
  const [expanded, setExpanded] = useState(null);

  const { data: cuentas = [], isLoading } = useCuentasCobrar(filtro);
  const { data: abonos } = useAbonosByFactura(expanded);
  const aplicarAbono = useAplicarAbono(() => { setModalAbono(null); setFormAbono({ monto: '', fecha: new Date().toISOString().split('T')[0], metodoPago: 'Efectivo', referencia: '' }); });

  const activas = cuentas.filter(c => c.estado === 1 || c.estado === 3);
  const saldadas = cuentas.filter(c => c.estado === 2);
  const totalPendiente = activas.reduce((s, c) => s + (c.total - (c.pagado || 0)), 0);

  function handlePagar(cuenta) {
    setModalAbono(cuenta);
    setFormAbono(prev => ({ ...prev, monto: ((cuenta.total || 0) - (cuenta.pagado || 0)).toFixed(2) }));
  }

  function submitAbono() {
    if (!modalAbono || !formAbono.monto || parseFloat(formAbono.monto) <= 0) return toast.error('Ingrese un monto válido');
    aplicarAbono.mutate({
      cuentaCobrarId: modalAbono.cuentaCobrarId || modalAbono.facturaId,
      facturaId: modalAbono.facturaId,
      monto: parseFloat(formAbono.monto),
      fecha: formAbono.fecha,
      metodoPago: formAbono.metodoPago,
      referencia: formAbono.referencia,
    });
  }

  return (
    <div className="space-y-4 sm:space-y-5 px-4 sm:px-0 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Cuentas por Cobrar</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{cuentas.length} registros</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Total', cuentas.length, 'var(--text-primary)'],
          ['Saldadas', saldadas.length, '#22c55e'],
          ['Pendientes', activas.length, '#f59e0b'],
          ['Por Cobrar', fmt(totalPendiente), '#ef4444'],
        ].map(([l, v, color]) => (
          <div key={l} className="card text-center py-3">
            <p className="text-lg sm:text-xl font-extrabold" style={{ color }}>{v}</p>
            <p className="text-[10px] sm:text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{l}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {[['Todos', ''], ['Activas', '1'], ['Cuentas Abiertas', '3'], ['Saldadas', '2'], ['Canceladas', '0']].map(([l, v]) => (
          <button key={v} onClick={() => setFiltro(v)} className={`btn-sm rounded-lg ${filtro === v ? 'btn-primary' : 'btn-secondary'}`}>{l}</button>
        ))}
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr>
            <th>Cliente</th><th>Factura</th><th>Total</th><th>Pagado</th><th>Pendiente</th><th>Estado</th><th className="text-right">Acción</th>
          </tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan="7" className="text-center py-8">Cargando...</td></tr> :
              cuentas.length === 0 ? <tr><td colSpan="7" className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Sin registros</td></tr> :
              cuentas.map(c => {
                const pend = (c.total || 0) - (c.pagado || 0);
                return (
                  <tr key={c.cuentaCobrarId || c.facturaId}>
                    <td className="font-medium">{c.nombreCliente || c.cliente || '—'}</td>
                    <td><button onClick={() => setExpanded(expanded === (c.facturaId || c.cuentaCobrarId) ? null : (c.facturaId || c.cuentaCobrarId))} className="text-brand-600 hover:underline">#{c.facturaId || c.cuentaCobrarId}</button></td>
                    <td>{fmt(c.total)}</td>
                    <td>{fmt(c.pagado || 0)}</td>
                    <td className={pend > 0 ? 'text-red-500 font-semibold' : 'text-green-500'}>{fmt(pend)}</td>
                    <td><span className={`badge-${c.estado === 2 ? 'green' : c.estado === 0 ? 'red' : 'yellow'}`}>{ESTADOS[c.estado] || '—'}</span></td>
                    <td className="text-right">
                      {pend > 0 && <button onClick={() => handlePagar(c)} className="btn-primary btn-sm"><DollarSign size={14} /> Cobrar</button>}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {expanded && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Abonos — Factura #{expanded}</h3>
            <button onClick={() => setExpanded(null)} className="btn-sm btn-ghost">Cerrar</button>
          </div>
          {(!abonos || abonos.length === 0) ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sin abonos registrados</p>
          ) : (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Fecha</th><th>Monto</th><th>Método</th><th>Referencia</th></tr></thead>
                <tbody>
                  {abonos.map((a, i) => (
                    <tr key={a.abonoId || i}>
                      <td>{a.fecha ? new Date(a.fecha).toLocaleDateString() : '—'}</td>
                      <td className="font-semibold text-green-500">{fmt(a.monto)}</td>
                      <td>{a.metodoPago || '—'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{a.referencia || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {modalAbono && (
        <div className="modal-overlay" onClick={() => setModalAbono(null)}>
          <div className="modal-box max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Registrar Abono</h2>
              <button onClick={() => setModalAbono(null)} className="btn-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Cliente</label>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{modalAbono.nombreCliente || modalAbono.cliente}</p>
              </div>
              <div>
                <label className="label">Monto a cobrar</label>
                <input type="number" step="0.01" className="input" value={formAbono.monto} onChange={e => setFormAbono(p => ({ ...p, monto: e.target.value }))} />
              </div>
              <div>
                <label className="label">Fecha</label>
                <input type="date" className="input" value={formAbono.fecha} onChange={e => setFormAbono(p => ({ ...p, fecha: e.target.value }))} />
              </div>
              <div>
                <label className="label">Método de pago</label>
                <select className="input" value={formAbono.metodoPago} onChange={e => setFormAbono(p => ({ ...p, metodoPago: e.target.value }))}>
                  <option>Efectivo</option><option>Transferencia</option><option>Cheque</option><option>Tarjeta</option>
                </select>
              </div>
              <div>
                <label className="label">Referencia</label>
                <input type="text" className="input" value={formAbono.referencia} onChange={e => setFormAbono(p => ({ ...p, referencia: e.target.value }))} />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={submitAbono} className="btn-primary flex-1" disabled={aplicarAbono.isPending}>
                  {aplicarAbono.isPending ? 'Registrando...' : 'Confirmar Abono'}
                </button>
                <button onClick={() => setModalAbono(null)} className="btn-secondary">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
