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
import { AdminPinModal } from '../components/features/AdminModal/Adminpinmodal'; // ← nuevo

import * as commonService from '../services/commonService';
import * as facturasService from '../services/facturasService';
// import { printFactura } from '../../../utils/print/printFactura'

import { printFactura } from '../utils/print/printFactura'


export function FacturasPage() {
  const { user } = useAuthStore();
  const isAdmin = isAdminUser(user);
  const { puedeVer, puedeAcceder } = usePermiso();

  if (!puedeVer('verFacturas')) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <h2 style={{ color: 'var(--text-primary)' }} className="text-xl sm:text-2xl font-bold mb-2">
            Acceso Denegado
          </h2>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm sm:text-base">
            No tienes permisos para acceder a facturas
          </p>
        </div>
      </div>
    );
  }

  const hoy = localDate();

  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(hoy);
  const [soloMios, setSoloMios] = useState(!isAdmin);
  const [modal, setModal] = useState(null);
  const [cobroFactura, setCobroFactura] = useState(null);

  const [confirmarId, setConfirmarId] = useState(null);


  // ── PIN modal state ──────────────────────────────────────────────────────────
  // pinPendiente guarda el facturaId que se quiere cancelar mientras se verifica
  const [pinPendiente, setPinPendiente] = useState(null);
  // ────────────────────────────────────────────────────────────────────────────

  const { data: facturas = [], isLoading } = useFacturas(estado, desde, hasta, soloMios, user?.usuarioId);
  const cancelarMutation = useCancelarFactura();

  const list = facturas.filter(f => {
    const q = search.toLowerCase();
    return !q || f.nombreCliente.toLowerCase().includes(q) || String(f.facturaId).includes(q);
  });

  const totalMes = facturas.reduce((s, f) => f.estado !== 0 ? s + f.total : s, 0);
  const pendiente = facturas.reduce((s, f) => f.estado !== 0 ? s + (f.total - f.pagado) : s, 0);

  const onNuevaFacturaSuccess = (res, variables) => {
    setModal(null);

    // SI ES CRÉDITO NO ABRIR COBRO
    if (variables?.tipoFactura === 1) {
      return;
    }

    // SOLO CONTADO ABRE COBRO
    const facturaId = res?.id;

    if (facturaId) {
      facturasService
        .getFacturaById(facturaId)
        .then(data => setCobroFactura(data));
    }
  };

  const handleImprimir = async (facturaId) => {
    try {
      const data = await facturasService.getFacturaById(facturaId);
      const [empresa, control] = await Promise.all([
        commonService.getEmpresa(),
        commonService.getControlesEmpresa(),
      ]);
      printFactura(data, empresa, control);
    } catch (e) {
      console.error(e);
    }
  };



  const handleSolicitarCancelacion = (facturaId) => {
    setConfirmarId(facturaId);
  };
  // Paso 2 – el usuario confirmó en el diálogo
  const handleConfirmarCancelacion = () => {
    if (confirmarId == null) return;
    if (isAdmin) {
      cancelarMutation.mutate(confirmarId);
      setConfirmarId(null);
    } else {
      setPinPendiente(confirmarId);
      setConfirmarId(null);
    }
  };




  /** Paso 2 – el PIN fue verificado correctamente por AdminPinModal */
  const handlePinConfirmado = () => {
    if (pinPendiente != null) {
      cancelarMutation.mutate(pinPendiente);
    }
    setPinPendiente(null);
  };

  /** El usuario cerró el modal de PIN sin confirmar */
  const handlePinCancelado = () => setPinPendiente(null);
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 sm:space-y-5 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Facturas</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{facturas.length} facturas</p>
        </div>
        {puedeAcceder(['crearFacturas']) && (
          <button onClick={() => setModal('nueva')} className="btn-primary w-full sm:w-auto">
            <Plus size={15} /> Nueva factura
          </button>
        )}
      </div>

      {/* Cards estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Total', facturas.length, 'var(--text-primary)'],
          ['Saldadas', facturas.filter(f => f.estado === 2).length, '#22c55e'],
          ['Cuentas abiertas', facturas.filter(f => f.estado === 3).length, '#f59e0b'],
          ['Canceladas', facturas.filter(f => f.estado === 0).length, 'var(--text-muted)'],
        ].map(([l, v, color]) => (
          <div key={l} className="card text-center py-3">
            <p className="text-lg sm:text-xl font-extrabold" style={{ color }}>{v}</p>
            <p className="text-[10px] sm:text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{l}</p>
          </div>
        ))}
      </div>

      {/* Resumen financiero */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="card flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-green-50 dark:bg-green-900/20">
            <DollarSign size={16} className="sm:w-[18px] sm:h-[18px] text-green-500" />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total facturado</p>
            <p className="text-base sm:text-lg font-extrabold text-green-500 break-words">{fmt(totalMes)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
            <FileText size={16} className="sm:w-[18px] sm:h-[18px] text-yellow-500" />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Por cobrar</p>
            <p className="text-base sm:text-lg font-extrabold text-yellow-500 break-words">{fmt(pendiente)}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div className="relative flex-1 sm:flex-none">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input pl-8 w-full sm:w-64" placeholder="Buscar cliente o # factura..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <select className="input w-full sm:w-40" value={estado} onChange={e => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="0">Cancelada</option>
          <option value="1">Activa</option>
          <option value="2">Saldada</option>
          <option value="3">Cuenta abierta</option>
        </select>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="label text-xs sm:text-sm">Desde</label>
            <input type="date" className="input w-full sm:w-36" value={desde} onChange={e => setDesde(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="label text-xs sm:text-sm">Hasta</label>
            <input type="date" className="input w-full sm:w-36" value={hasta} onChange={e => setHasta(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => { setDesde(hoy); setHasta(hoy); }} className="btn-secondary btn-sm flex-1 sm:flex-none">Hoy</button>
          <button onClick={() => {
            const d = new Date();
            setDesde(localDate(new Date(d.getFullYear(), d.getMonth(), 1)));
            setHasta(hoy);
          }} className="btn-secondary btn-sm flex-1 sm:flex-none">Este mes</button>
        </div>

        {isAdmin && (
          <button onClick={() => setSoloMios(s => !s)}
            className={`${soloMios ? 'btn-primary' : 'btn-secondary'} btn-sm w-full sm:w-auto`}>
            {soloMios ? '👤 Solo las mías' : '👥 Todas'}
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="tbl-wrap overflow-x-auto">
        <table className="tbl min-w-[800px] sm:min-w-full">
          <thead>
            <tr>
              <th className="w-1">#</th>
              <th className="w-38">Cliente</th>
              <th className="w-32">Fecha</th>
              <th className="w-36">Tipo pago</th>
              <th className="text-right w-40">Total</th>
              <th className="text-right w-40">Pagado</th>
              <th className="text-right w-40">Pendiente</th>
              <th className="w-32">Estado</th>
              <th className="w-24">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={9} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Cargando...</td></tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12">
                  <FileText size={24} className="sm:w-[28px] sm:h-[28px] mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-muted)' }} className="text-sm">No hay facturas</p>
                </td>
              </tr>
            ) : (
              list.map(f => (
                <tr key={f.facturaId}>
                  <td className="font-bold text-sm" style={{ color: 'var(--brand)' }}>#{f.facturaId}</td>
                  <td className="font-medium text-sm break-words">{f.nombreCliente}</td>
                  <td className="text-sm whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(f.fecha).toLocaleDateString('es-DO')}
                  </td>
                  <td><span className="badge badge-gray whitespace-nowrap">{f.tipoPago}</span></td>
                  <td className="text-start"><span className="font-bold text-sm tabular-nums whitespace-nowrap">{fmt(f.total)}</span></td>
                  <td className="text-start"><span className="font-semibold text-sm tabular-nums text-green-500 whitespace-nowrap">{fmt(f.pagado)}</span></td>
                  <td className="text-start">
                    {(f.total - f.pagado) > 0
                      ? <span className="font-semibold text-sm tabular-nums text-red-500 whitespace-nowrap">{fmt(f.total - f.pagado)}</span>
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>
                    }
                  </td>
                  <td><span className="whitespace-nowrap">{ESTADO_FACTURA[f.estado]}</span></td>
                  <td>
                    <div className="flex gap-1 flex-wrap sm:flex-nowrap">
                      <button onClick={() => setModal({ ver: f.facturaId })} className="btn-ghost btn-icon btn-sm" title="Ver">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => handleImprimir(f.facturaId)} className="btn-ghost btn-icon btn-sm" title="Imprimir">
                        <Printer size={14} />
                      </button>
                      {(f.estado === 3 || f.estado === 1) && (f.total - f.pagado) > 0 && (
                        <button onClick={() => setCobroFactura(f)} className="btn-ghost btn-icon btn-sm text-green-500" title="Cobrar">
                          <DollarSign size={14} />
                        </button>
                      )}
                      {f.estado !== 0 && (
                        // ← Ahora llama al flujo de PIN en lugar de confirm()
                        <button
                          onClick={() => handleSolicitarCancelacion(f.facturaId)}
                          className="btn-ghost btn-icon btn-sm text-red-400"
                          title="Cancelar factura"
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modales principales */}
      {modal === 'nueva' && <NuevaFacturaModal onClose={() => setModal(null)} onSaveSuccess={onNuevaFacturaSuccess} />}
      {modal?.ver && <FacturaDetalle facturaId={modal.ver} onClose={() => setModal(null)} />}

      {cobroFactura && (
        <CobroModal factura={cobroFactura} onClose={() => setCobroFactura(null)} />
      )}

      {/* ── Modal de PIN de administrador ── */}
      {pinPendiente != null && (
        <AdminPinModal
          titulo="Cancelar factura"
          descripcion={`Para cancelar la factura #${pinPendiente} se requiere la contraseña de un administrador.`}
          onConfirm={handlePinConfirmado}
          onClose={handlePinCancelado}
        />
      )}

      {/* ── Confirmación de cancelación ── */}
      {confirmarId != null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmarId(null); }}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4"
            style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)' }}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3 rounded-2xl bg-red-50">
                <XCircle size={28} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>
                  ¿Cancelar factura #{confirmarId}?
                </h2>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Esta acción no se puede deshacer. La factura quedará marcada como cancelada.
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button className="btn-secondary flex-1" onClick={() => setConfirmarId(null)}>
                No, volver
              </button>
              <button className="btn-primary flex-1 bg-red-500 hover:bg-red-600 border-red-500" onClick={handleConfirmarCancelacion}>
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}