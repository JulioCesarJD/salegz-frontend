import React, { useState } from 'react';
import { Plus, Search, Eye, XCircle, DollarSign, FileText, Printer } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { usePermiso } from '../hooks/usePermiso';
import { isAdminUser } from '../utils/auth';
import { useFacturas, useCancelarFactura } from '../hooks/useFacturas';
import { ESTADO_FACTURA } from '../constants/facturacion';
import { fmt } from '../utils/format';
import { localDate } from '../utils/date';
import { FacturaDetalle } from '../components/features/facturas/FacturaDetalle';
import { CobroModal } from '../components/features/facturas/CobroModal';
import { NuevaFacturaModal } from '../components/features/facturas/NuevaFacturaModal';
import { printFactura } from '../utils/printFactura';
import * as commonService from '../services/commonService';
import * as facturasService from '../services/facturasService';

export function FacturasPage() {
  const { user } = useAuthStore();
  const isAdmin = isAdminUser(user);
  const { puedeVer, puedeAcceder } = usePermiso();

  // Verificar acceso a Facturas
  if (!puedeVer('verFacturas')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold mb-2">
            Acceso Denegado
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            No tienes permisos para acceder a facturas
          </p>
        </div>
      </div>
    )
  }
  const hoy = localDate();

  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(hoy);
  const [soloMios, setSoloMios] = useState(!isAdmin);
  const [modal, setModal] = useState(null);
  const [cobroFactura, setCobroFactura] = useState(null);

  const { data: facturas = [], isLoading } = useFacturas(estado, desde, hasta, soloMios, user?.usuarioId);
  const cancelarMutation = useCancelarFactura();

  const list = facturas.filter(f => {
    const q = search.toLowerCase();
    return !q || f.nombreCliente.toLowerCase().includes(q) || String(f.facturaId).includes(q);
  });
  const totalMes = facturas.reduce((s, f) => f.estado !== 0 ? s + f.total : s, 0);
  const pendiente = facturas.reduce((s, f) => f.estado !== 0 ? s + (f.total - f.pagado) : s, 0);

  const onNuevaFacturaSuccess = (res) => {
    setModal(null);
    const facturaId = res?.id;
    if (facturaId) {
      facturasService.getFacturaById(facturaId).then(data => setCobroFactura(data));
    }
  };

  const handleImprimir = async (facturaId) => {
    try {
      const data = await facturasService.getFacturaById(facturaId);
      const [empresa, control] = await Promise.all([
        commonService.getEmpresa(),
        commonService.getControlesEmpresa()
      ]);
      printFactura(data, empresa, control);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Facturas</h1>
          <p className="page-sub">{facturas.length} facturas</p>
        </div>
        {puedeAcceder(['crearFacturas']) && (
          <button onClick={() => setModal('nueva')} className="btn-primary">
            <Plus size={15}/> Nueva factura
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Total', facturas.length, 'var(--text-primary)'],
          ['Saldadas', facturas.filter(f => f.estado === 2).length, '#22c55e'],
          ['Cuentas abiertas', facturas.filter(f => f.estado === 3).length, '#f59e0b'],
          ['Canceladas', facturas.filter(f => f.estado === 0).length, 'var(--text-muted)']
        ].map(([l, v, color]) => (
          <div key={l} className="card text-center py-3">
            <p className="text-xl font-extrabold" style={{ color }}>{v}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{l}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-900/20">
            <DollarSign size={18} className="text-green-500"/>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total facturado</p>
            <p className="text-lg font-extrabold text-green-500">{fmt(totalMes)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
            <FileText size={18} className="text-yellow-500"/>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Por cobrar</p>
            <p className="text-lg font-extrabold text-yellow-500">{fmt(pendiente)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}/>
          <input className="input pl-8 w-52" placeholder="Buscar cliente o # factura..."
                 value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <select className="input w-40" value={estado} onChange={e => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="0">Cancelada</option>
          <option value="1">Activa</option>
          <option value="2">Saldada</option>
          <option value="3">Cuenta abierta</option>
        </select>
        <div>
          <label className="label">Desde</label>
          <input type="date" className="input w-36" value={desde} onChange={e => setDesde(e.target.value)} />
        </div>
        <div>
          <label className="label">Hasta</label>
          <input type="date" className="input w-36" value={hasta} onChange={e => setHasta(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setDesde(hoy); setHasta(hoy) }} className="btn-secondary btn-sm">Hoy</button>
          <button onClick={() => {
            const d = new Date();
            setDesde(localDate(new Date(d.getFullYear(), d.getMonth(), 1)));
            setHasta(hoy);
          }} className="btn-secondary btn-sm">Este mes</button>
        </div>
        {isAdmin && (
          <button onClick={() => setSoloMios(s => !s)}
                  className={soloMios ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}>
            {soloMios ? '👤 Solo las mías' : '👥 Todas'}
          </button>
        )}
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th>Cliente</th>
              <th className="w-28">Fecha</th>
              <th className="w-32">Tipo pago</th>
              <th className="text-right w-36">Total</th>
              <th className="text-right w-36">Pagado</th>
              <th className="text-right w-36">Pendiente</th>
              <th className="w-28">Estado</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={9} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Cargando...</td></tr>
              : list.length === 0 ? <tr><td colSpan={9} className="text-center py-12"><FileText size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }}/><p style={{ color: 'var(--text-muted)' }}>No hay facturas</p></td></tr>
                : list.map(f => (
                  <tr key={f.facturaId}>
                    <td className="font-bold text-sm" style={{ color: 'var(--brand)' }}>#{f.facturaId}</td>
                    <td className="font-medium text-sm">{f.nombreCliente}</td>
                    <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{new Date(f.fecha).toLocaleDateString('es-DO')}</td>
                    <td><span className="badge badge-gray">{f.tipoPago}</span></td>
                    <td className="text-right"><span className="font-bold text-sm tabular-nums">{fmt(f.total)}</span></td>
                    <td className="text-right"><span className="font-semibold text-sm tabular-nums text-green-500">{fmt(f.pagado)}</span></td>
                    <td className="text-right">
                      { (f.total - f.pagado) > 0 ? <span className="font-semibold text-sm tabular-nums text-red-500">{fmt(f.total - f.pagado)}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span> }
                    </td>
                    <td>{ESTADO_FACTURA[f.estado]}</td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => setModal({ ver: f.facturaId })} className="btn-ghost btn-icon btn-sm" title="Ver"><Eye size={14}/></button>
                        <button onClick={() => handleImprimir(f.facturaId)} className="btn-ghost btn-icon btn-sm" title="Imprimir"><Printer size={14}/></button>
                        {(f.estado === 3 || f.estado === 1) && (f.total - f.pagado) > 0 && (
                          <button onClick={() => setCobroFactura(f)} className="btn-ghost btn-icon btn-sm text-green-500" title="Cobrar"><DollarSign size={14}/></button>
                        )}
                        {f.estado !== 0 && (
                          <button onClick={() => { if(confirm('¿Cancelar esta factura?')) cancelarMutation.mutate(f.facturaId) }} 
                                  className="btn-ghost btn-icon btn-sm text-red-400" title="Cancelar">
                            <XCircle size={14}/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {modal === 'nueva' && <NuevaFacturaModal onClose={() => setModal(null)} onSaveSuccess={onNuevaFacturaSuccess} />}
      {modal?.ver && <FacturaDetalle facturaId={modal.ver} onClose={() => setModal(null)} />}
      
      {cobroFactura && (
        <CobroModal
          factura={cobroFactura}
          onClose={() => setCobroFactura(null)}
        />
      )}
    </div>
  );
}
