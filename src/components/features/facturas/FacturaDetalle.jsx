import React, { useState } from 'react';
import { Printer, Pencil } from 'lucide-react';
import { useFactura, useEmpresaInfo } from '../../../hooks/useFacturas';
import { ESTADO_FACTURA } from '../../../constants/facturacion';
import { fmt } from '../../../utils/format';
import { EditarFacturaModal } from './EditarFacturaModal';
import { printFactura } from '../../../utils/print/printFactura'



export function FacturaDetalle({ facturaId, onClose }) {
  const { data: f, isLoading: loadingF } = useFactura(facturaId);
  const { empresa, control, isLoading: loadingE } = useEmpresaInfo();
  const [editando, setEditando] = useState(false);


  const handlePrint = () => {
    if (f && empresa && control) printFactura(f, empresa, control);
  };

  if (loadingF || loadingE) return (
    <div className="modal-overlay">
      <div className="modal-box max-w-2xl flex items-center justify-center py-12">
        <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              Factura #{f?.facturaId}
            </h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {new Date(f?.fecha).toLocaleDateString("es-DO", { dateStyle: "full" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {ESTADO_FACTURA[f?.estado]}
            <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            ["Cliente", f?.nombreCliente],
            ["Usuario", f?.usuario],
            ["Tipo pago", f?.tipoPago],
            ["Orden #", f?.numOrden],
          ].map(([l, v]) => (
            <div key={l} className="p-3 rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{l}</p>
              <p className="font-semibold text-sm mt-0.5" style={{ color: "var(--text-primary)" }}>
                {v || "—"}
              </p>
            </div>
          ))}

          {/* ✅ RNC del cliente */}
          {f?.rncCliente && (
            <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>RNC</p>
              <p className="font-semibold text-sm mt-0.5" style={{ color: "var(--text-primary)" }}>
                {f.rncCliente}
              </p>
            </div>
          )}
        </div>
        <div className="tbl-wrap mb-4">
          <table className="tbl">
            <thead>
              <tr>
                <th>Producto</th>
                <th className="text-right">Cant.</th>
                <th className="text-right">ITBS</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {f?.detalles?.map((d, i) => (
                <tr key={i}>
                  <td className="font-medium">{d.producto}</td>
                  <td className="text-start">{d.cantidad}</td>
                  <td className="text-start">{fmt(d.itbs)}</td>
                  <td className="text-center font-semibold">{fmt(d.subTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-2 border-t pt-4" style={{ borderColor: "var(--border)" }}>
          {[
            ["Exento", fmt(f?.exento), false],
            ["Gravado", fmt(f?.gravado), false],
            ["ITBS", fmt(f?.itbs), false],
            ["Total", fmt(f?.total), true],
            ["Pagado", fmt(f?.pagado), false],
            ["Pendiente", fmt((f?.total || 0) - (f?.pagado || 0)), false],
          ].map(([l, v, bold]) => (
            <div key={l} className="flex justify-between">
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>{l}</span>
              <span className={`text-sm ${bold ? "text-lg font-extrabold" : "font-medium"}`}
                style={{ color: bold ? "var(--text-primary)" : "var(--text-secondary)" }}>
                {v}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1">Cerrar</button>
          {f?.estado === 3 && (
            <button onClick={() => setEditando(true)} className="btn-secondary flex-1">
              <Pencil size={15} /> Editar
            </button>
          )}
          <button onClick={handlePrint} className="btn-primary flex-1">
            <Printer size={15} /> Imprimir
          </button>
        </div>

        {editando && (
          <EditarFacturaModal
            factura={f}
            onClose={() => setEditando(false)}
            onSaveSuccess={() => { setEditando(false); onClose(); }}
          />
        )}
      </div>
    </div>
  );
}
