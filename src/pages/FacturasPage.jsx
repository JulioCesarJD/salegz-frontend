import React, { useState } from "react";
import {
  Search,
  Eye,
  XCircle,
  DollarSign,
  FileText,
  Printer,
  Plus,
  CheckCircle2,
  Clock3,
  Ban,
  CircleDollarSign,
} from "lucide-react";

import { useAuthStore } from "../store/authStore";
import { usePermiso } from "../hooks/usePermiso";
import { isAdminUser } from "../utils/auth";
import { useFacturas, useCancelarFactura } from "../hooks/useFacturas";

import { TIPO_COMPROBANTE, METODO_PAGO_UI } from "../constants/facturacion";

import { fmt } from "../utils/format";
import { localDate } from "../utils/date";
import { FacturaDetalle } from "../components/features/facturas/FacturaDetalle";
import { CobroModal } from "../components/features/facturas/CobroModal";
import { NuevaFacturaModal } from "../components/features/facturas/NuevaFacturaModal";
import { AdminPinModal } from "../components/features/AdminModal/Adminpinmodal";

import * as commonService from "../services/commonService";
import * as facturasService from "../services/facturasService";
import { printFactura } from "../utils/print/printFactura";

// ======================================================
// ESTADOS DE FACTURA
// ======================================================

const ESTADOS = {
  0: {
    label: "Cancelada",
    className: "bg-red-500/10 text-red-600 border-red-500/20",
    dot: "bg-red-500",
    icon: Ban,
  },
  1: {
    label: "Activa",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    dot: "bg-blue-500",
    icon: CheckCircle2,
  },
  2: {
    label: "Saldada",
    className: "bg-green-500/10 text-green-600 border-green-500/20",
    dot: "bg-green-500",
    icon: CheckCircle2,
  },
  3: {
    label: "Cuenta abierta",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    dot: "bg-amber-500",
    icon: Clock3,
  },
};

const normalizarEstado = (estado) => {
  if (estado == null) return null;

  if (typeof estado === "number" || /^\d+$/.test(String(estado))) {
    return Number(estado);
  }

  const estados = {
    Cancelado: 0,
    Cancelada: 0,
    Activo: 1,
    Activa: 1,
    Saldado: 2,
    Saldada: 2,
    CuentaAbierta: 3,
    "Cuenta abierta": 3,
  };

  return estados[estado] ?? null;
};

const EstadoBadge = ({ estado }) => {
  const key = normalizarEstado(estado);
  const config = ESTADOS[key];

  if (!config) {
    return (
      <span className="inline-flex px-2.5 py-1 rounded-full text-xs bg-gray-500/10 text-gray-500">
        {String(estado ?? "Sin estado")}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold whitespace-nowrap ${config.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

// ======================================================
// HELPERS
// ======================================================

const tipoPagoLabel = (f) =>
  f?.tipo ? "Crédito" : METODO_PAGO_UI[f?.metodoPago] || "—";

const tipoComprobanteLabel = (tc) => {
  if (tc == null || tc === "") return "—";

  const comprobante = TIPO_COMPROBANTE.find(
    (item) => item.codigo === String(tc) || item.valor === Number(tc),
  );

  return comprobante?.label || String(tc);
};

// ======================================================
// COMPONENTE PRINCIPAL
// ======================================================

export function FacturasPage() {
  const { user } = useAuthStore();
  const isAdmin = isAdminUser(user);
  const { puedeVer, puedeAcceder } = usePermiso();

  const hoy = localDate();

  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(hoy);
  const [tipoCompFiltro, setTipoCompFiltro] = useState("");
  const [modal, setModal] = useState(null);
  const [cobroFactura, setCobroFactura] = useState(null);
  const [confirmarId, setConfirmarId] = useState(null);
  const [pinPendiente, setPinPendiente] = useState(null);

  const puedeVerFacturas = puedeVer("verFacturas");

  const { data, isLoading } = useFacturas(
    {
      search,
      estado,
      tipoComprobante: tipoCompFiltro,
      fechaDesde: desde,
      fechaHasta: hasta,
      page: 1,
      pageSize: 200,
    },
    { enabled: puedeVerFacturas },
  );

  const cancelarMutation = useCancelarFactura();

  if (!puedeVerFacturas) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">
            Acceso denegado
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            No tienes permisos para acceder a facturas.
          </p>
        </div>
      </div>
    );
  }

  const facturas = Array.isArray(data) ? data : (data?.items ?? []);

  const list = facturas.filter((f) => {
    const q = search.toLowerCase();

    return (
      !q ||
      (f.nombreCliente || "").toLowerCase().includes(q) ||
      String(f.facturaId).includes(q)
    );
  });

  const totalMes = facturas.reduce(
    (s, f) =>
      normalizarEstado(f.estado) !== 0 ? s + (Number(f.total) || 0) : s,
    0,
  );

  const pendiente = facturas.reduce(
    (s, f) =>
      normalizarEstado(f.estado) !== 0
        ? s + Math.max(0, (Number(f.total) || 0) - (Number(f.montoPagado) || 0))
        : s,
    0,
  );

  const cantidadEstado = (key) =>
    facturas.filter((f) => normalizarEstado(f.estado) === key).length;

  const onNuevaFacturaSuccess = (res) => {
    setModal(null);

    if (res?.tipo) return;

    const facturaId = res?.facturaId;

    if (facturaId) {
      facturasService
        .getFacturaById(facturaId)
        .then((data) => setCobroFactura(data));
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

  const handleConfirmarCancelacion = () => {
    if (confirmarId == null) return;

    setPinPendiente(confirmarId);
    setConfirmarId(null);
  };

  const handlePinConfirmado = () => {
    if (pinPendiente != null) {
      cancelarMutation.mutate(pinPendiente);
    }

    setPinPendiente(null);
  };

  return (
    <div className="space-y-5 px-4 sm:px-0">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Facturas</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {facturas.length} facturas registradas
          </p>
        </div>

        {puedeAcceder(["crearFacturas"]) && (
          <button
            onClick={() => setModal("nueva")}
            className="btn-primary w-full sm:w-auto"
            style={{
              background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
            }}
          >
            <Plus size={16} />
            Nueva factura
          </button>
        )}
      </div>

      {/* ESTADÍSTICAS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-[var(--text-muted)]">Total</p>
              <p className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">
                {facturas.length}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-500/10 text-gray-500">
              <FileText size={20} />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-[var(--text-muted)]">Saldadas</p>
              <p className="text-2xl font-extrabold text-green-500 mt-1">
                {cantidadEstado(2)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-green-500/10 text-green-500">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-[var(--text-muted)]">
                Cuentas abiertas
              </p>
              <p className="text-2xl font-extrabold text-amber-500 mt-1">
                {cantidadEstado(3)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock3 size={20} />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-[var(--text-muted)]">Canceladas</p>
              <p className="text-2xl font-extrabold text-red-500 mt-1">
                {cantidadEstado(0)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
              <Ban size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* RESUMEN FINANCIERO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="card flex items-center gap-3 p-4">
          <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Total facturado</p>
            <p className="text-lg font-extrabold text-green-500">
              {fmt(totalMes)}
            </p>
          </div>
        </div>

        <div className="card flex items-center gap-3 p-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <CircleDollarSign size={20} />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Por cobrar</p>
            <p className="text-lg font-extrabold text-amber-500">
              {fmt(pendiente)}
            </p>
          </div>
        </div>
      </div>

      {/* REFERENCIA DE ESTADOS */}
      <div className="card p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Estados de facturas
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Referencia de colores utilizados en el sistema.
            </p>
          </div>
          <div className="p-2 rounded-xl bg-green-500/10 text-green-500">
            <FileText size={18} />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(ESTADOS).map(([key, item]) => {
            const Icon = item.icon;

            return (
              <div
                key={key}
                className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)]/40"
              >
                <div className={`p-2 rounded-lg ${item.className}`}>
                  <Icon size={17} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--text-primary)]">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    {cantidadEstado(Number(key))} facturas
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTROS */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end flex-wrap">
          <div className="relative flex-1 sm:flex-none">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              className="input pl-9 w-full sm:w-64"
              placeholder="Buscar cliente o # factura..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <label className="label text-xs">Estado</label>
            <select
              className="input w-full sm:w-40"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              {Object.entries(ESTADOS).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="label text-xs">Desde</label>
              <input
                type="date"
                className="input w-full sm:w-36"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
              />
            </div>

            <div className="flex-1">
              <label className="label text-xs">Hasta</label>
              <input
                type="date"
                className="input w-full sm:w-36"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setDesde(hoy);
                setHasta(hoy);
              }}
              className="btn-secondary btn-sm flex-1"
            >
              Hoy
            </button>

            <button
              onClick={() => {
                const d = new Date();
                setDesde(localDate(new Date(d.getFullYear(), d.getMonth(), 1)));
                setHasta(hoy);
              }}
              className="btn-secondary btn-sm flex-1"
            >
              Este mes
            </button>
          </div>

          <div>
            <label className="label text-xs">Tipo comprobante</label>
            <select
              className="input w-full sm:w-64"
              value={tipoCompFiltro}
              onChange={(e) => setTipoCompFiltro(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              {TIPO_COMPROBANTE.map((tipo) => (
                <option key={tipo.codigo} value={tipo.valor}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="tbl-wrap overflow-x-auto">
        <table className="tbl min-w-[1000px] w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Tipo pago</th>
              <th className="text-right">Total</th>
              <th className="text-right">Pagado</th>
              <th className="text-right">Pendiente</th>
              <th>Estado</th>
              <th>Comprobante</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={10}
                  className="text-center py-10 text-[var(--text-muted)]"
                >
                  Cargando facturas...
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-12">
                  <FileText
                    size={28}
                    className="mx-auto mb-2 text-[var(--text-muted)]"
                  />
                  <p className="text-sm text-[var(--text-muted)]">
                    No hay facturas para mostrar.
                  </p>
                </td>
              </tr>
            ) : (
              list.map((f) => {
                const estadoActual = normalizarEstado(f.estado);
                const total = Number(f.total) || 0;
                const pagado = Number(f.montoPagado) || 0;
                const saldo = Math.max(0, total - pagado);

                return (
                  <tr key={f.facturaId}>
                    <td className="font-bold text-sm text-green-600">
                      #{f.facturaId}
                    </td>

                    <td className="font-medium text-sm">
                      {f.nombreCliente || "Consumidor Final"}
                    </td>

                    <td className="text-sm whitespace-nowrap text-[var(--text-secondary)]">
                      {f.fecha
                        ? new Date(f.fecha).toLocaleDateString("es-DO")
                        : "—"}
                    </td>

                    <td>
                      <span className="badge badge-gray whitespace-nowrap">
                        {tipoPagoLabel(f)}
                      </span>
                    </td>

                    <td className="text-right font-bold text-sm tabular-nums whitespace-nowrap">
                      {fmt(total)}
                    </td>

                    <td className="text-right font-semibold text-sm text-green-500 tabular-nums whitespace-nowrap">
                      {fmt(pagado)}
                    </td>

                    <td className="text-right font-semibold text-sm tabular-nums whitespace-nowrap">
                      {saldo > 0 ? (
                        <span className="text-red-500">{fmt(saldo)}</span>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </td>

                    <td>
                      <EstadoBadge estado={f.estado} />
                    </td>

                    <td className="text-sm whitespace-nowrap">
                      {tipoComprobanteLabel(f.tipoComprobante)}
                    </td>

                    <td>
                      <div className="flex gap-1 flex-nowrap">
                        <button
                          onClick={() => setModal({ ver: f.facturaId })}
                          className="btn-ghost btn-icon btn-sm"
                          title="Ver factura"
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          onClick={() => handleImprimir(f.facturaId)}
                          className="btn-ghost btn-icon btn-sm"
                          title="Imprimir"
                        >
                          <Printer size={14} />
                        </button>

                        {[1, 3].includes(estadoActual) && saldo > 0 && (
                          <button
                            onClick={() => setCobroFactura(f)}
                            className="btn-ghost btn-icon btn-sm text-green-500"
                            title="Registrar cobro"
                          >
                            <DollarSign size={14} />
                          </button>
                        )}

                        {isAdmin && estadoActual !== 0 && (
                          <button
                            onClick={() => setConfirmarId(f.facturaId)}
                            className="btn-ghost btn-icon btn-sm text-red-400"
                            title="Cancelar factura"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODALES */}
      {modal === "nueva" && (
        <NuevaFacturaModal
          onClose={() => setModal(null)}
          onSaveSuccess={onNuevaFacturaSuccess}
        />
      )}

      {modal?.ver && (
        <FacturaDetalle facturaId={modal.ver} onClose={() => setModal(null)} />
      )}

      {cobroFactura && (
        <CobroModal
          factura={cobroFactura}
          onClose={() => setCobroFactura(null)}
        />
      )}

      {pinPendiente != null && (
        <AdminPinModal
          titulo="Cancelar factura"
          descripcion={`Para cancelar la factura #${pinPendiente} se requiere la contraseña de un administrador.`}
          onConfirm={handlePinConfirmado}
          onClose={() => setPinPendiente(null)}
        />
      )}

      {confirmarId != null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(2px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmarId(null);
          }}
        >
          <div className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4 bg-[var(--bg-card)] border border-[var(--border)]">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3 rounded-2xl bg-red-500/10 text-red-500">
                <XCircle size={28} />
              </div>

              <div>
                <h2 className="text-base font-extrabold text-[var(--text-primary)]">
                  ¿Cancelar factura #{confirmarId}?
                </h2>

                <p className="text-xs mt-1 leading-relaxed text-[var(--text-muted)]">
                  Esta acción no se puede deshacer. La factura quedará marcada
                  como cancelada.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                className="btn-secondary flex-1"
                onClick={() => setConfirmarId(null)}
              >
                No, volver
              </button>

              <button
                className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 transition-colors disabled:opacity-50"
                onClick={handleConfirmarCancelacion}
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
