import { useState } from 'react';
import { Plus, DollarSign, Search, AlertTriangle, X } from 'lucide-react';
import { useCuentasPagar, useRegistrarPagoProveedor } from '../hooks/useCuentasPagar';
import { useCompras } from '../hooks/useCompras';
import { usePermiso } from '../hooks/usePermiso';
import { useAuthStore } from '../store/authStore';

const fmt = (v) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v || 0);
const ESTADOS = ['', 'Pagado', 'Pendiente', 'Vencido'];

export function CuentasPagarPage() {
  const { puedeVer } = usePermiso();
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modalPago, setModalPago] = useState(null);
  const [formPago, setFormPago] = useState({ compraId: '', monto: '', fecha: new Date().toISOString().split('T')[0], metodoPago: 'Efectivo', referencia: '' });

  const { data: cuentas = [], isLoading } = useCuentasPagar(filtroEstado);
  const { data: compras = [] } = useCompras('');
  const registrarPago = useRegistrarPagoProveedor(() => { setModalPago(null); setFormPago({ compraId: '', monto: '', fecha: new Date().toISOString().split('T')[0], metodoPago: 'Efectivo', referencia: '' }); });

  const pendientes = cuentas.filter(c => c.estado === 1);
  const pagadas = cuentas.filter(c => c.estado === 2);
  const totalPendiente = pendientes.reduce((s, c) => s + (c.monto - (c.pagado || 0)), 0);
  const totalPagado = pagadas.reduce((s, c) => s + (c.pagado || c.monto), 0);

  const handlePagar = (cuenta) => {
    setModalPago(cuenta);
    setFormPago(prev => ({ ...prev, compraId: cuenta.compraId || '', monto: (cuenta.monto - (cuenta.pagado || 0)).toFixed(2) }));
  };

  const submitPago = () => {
    if (!formPago.monto || parseFloat(formPago.monto) <= 0) return;
    registrarPago.mutate({ ...formPago, monto: parseFloat(formPago.monto) });
  };

  if (!puedeVer('verCuentasPagar')) {
    return <div className="flex items-center justify-center min-h-screen"><p style={{ color: 'var(--text-muted)' }}>Acceso denegado</p></div>;
  }

  return (
    <div className="space-y-4 sm:space-y-5 px-4 sm:px-0 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Cuentas por Pagar</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{cuentas.length} registros</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Total', cuentas.length, 'var(--text-primary)'],
          ['Pagadas', pagadas.length, '#22c55e'],
          ['Pendientes', pendientes.length, '#f59e0b'],
          ['Por Pagar', fmt(totalPendiente), '#ef4444'],
        ].map(([l, v, color]) => (
          <div key={l} className="card text-center py-3">
            <p className="text-lg sm:text-xl font-extrabold" style={{ color }}>{v}</p>
            <p className="text-[10px] sm:text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{l}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {ESTADOS.map((e, i) => (
          <button key={i} onClick={() => setFiltroEstado(e === '' ? '' : String(i))}
            className={`btn-sm rounded-lg ${filtroEstado === (e === '' ? '' : String(i)) ? 'btn-primary' : 'btn-secondary'}`}>
            {e || 'Todos'}
          </button>
        ))}
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Compra #</th>
              <th>Total</th>
              <th>Pagado</th>
              <th>Pendiente</th>
              <th>Estado</th>
              <th className="text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan="7" className="text-center py-8">Cargando...</td></tr> :
              cuentas.length === 0 ? <tr><td colSpan="7" className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Sin registros</td></tr> :
              cuentas.map(c => {
                const pend = c.monto - (c.pagado || 0);
                return (
                  <tr key={c.cuentaPagarId || c.compraId}>
                    <td className="font-medium">{c.proveedor || c.nombreProveedor || '—'}</td>
                    <td>#{c.compraId}</td>
                    <td>{fmt(c.monto)}</td>
                    <td>{fmt(c.pagado || 0)}</td>
                    <td className={pend > 0 ? 'text-red-500 font-semibold' : 'text-green-500'}>{fmt(pend)}</td>
                    <td><span className={`badge-${c.estado === 2 ? 'green' : pend > 0 ? 'yellow' : 'gray'}`}>{ESTADOS[c.estado] || 'Pendiente'}</span></td>
                    <td className="text-right">
                      {pend > 0 && <button onClick={() => handlePagar(c)} className="btn-primary btn-sm"><DollarSign size={14} /> Pagar</button>}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {modalPago && (
        <div className="modal-overlay" onClick={() => setModalPago(null)}>
          <div className="modal-box max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Registrar Pago</h2>
              <button onClick={() => setModalPago(null)} className="btn-icon"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Proveedor</label>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{modalPago.proveedor || modalPago.nombreProveedor}</p>
              </div>
              <div>
                <label className="label">Monto a pagar</label>
                <input type="number" step="0.01" className="input" value={formPago.monto} onChange={e => setFormPago(p => ({ ...p, monto: e.target.value }))} />
              </div>
              <div>
                <label className="label">Fecha</label>
                <input type="date" className="input" value={formPago.fecha} onChange={e => setFormPago(p => ({ ...p, fecha: e.target.value }))} />
              </div>
              <div>
                <label className="label">Método de pago</label>
                <select className="input" value={formPago.metodoPago} onChange={e => setFormPago(p => ({ ...p, metodoPago: e.target.value }))}>
                  <option>Efectivo</option>
                  <option>Transferencia</option>
                  <option>Cheque</option>
                  <option>Tarjeta</option>
                </select>
              </div>
              <div>
                <label className="label">Referencia</label>
                <input type="text" className="input" value={formPago.referencia} onChange={e => setFormPago(p => ({ ...p, referencia: e.target.value }))} placeholder="N° de cheque/transf." />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={submitPago} className="btn-primary flex-1" disabled={registrarPago.isPending}>
                  {registrarPago.isPending ? 'Registrando...' : 'Confirmar Pago'}
                </button>
                <button onClick={() => setModalPago(null)} className="btn-secondary">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
