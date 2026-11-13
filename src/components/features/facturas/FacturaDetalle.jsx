import React, { useState } from 'react';
import { Printer, Pencil } from 'lucide-react';
import { useFactura, useEmpresaInfo } from '../../../hooks/useFacturas';
import { ESTADO_FACTURA } from '../../../constants/facturacion';
import { fmt } from '../../../utils/format';
import { EditarFacturaModal } from './EditarFacturaModal';
import { printFactura } from '../../../utils/print/printFactura';

const METODO_PAGO_LABEL = {
  1: 'Efectivo',
  2: 'Cheque',
  3: 'Tarjeta',
  4: 'Transferencia',
};

// ✅ CAMBIO: normaliza el estado (soporta enum numérico o string)
const estadoKey = (estado) => {
  if (estado == null) return null;
  if (typeof estado === 'string') return estado;
  return { 0: 'Cancelado', 1: 'Activo', 2: 'Saldado', 3: 'CuentaAbierta' }[estado] ?? estado;
};

const tipoPagoLabel = (f) =>
  f?.tipo ? 'Crédito' : (METODO_PAGO_LABEL[f?.metodoPago] || '—');

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

  const estadoNorm = estadoKey(f?.estado);
  const esCuentaAbierta = estadoNorm === 'CuentaAbierta' || f?.estado === 3;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Factura #{f?.facturaId}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {/* ✅ CAMBIO: guard contra fecha null */}
              {f?.fecha ? new Date(f.fecha).toLocaleDateString('es-DO', { dateStyle: 'full' }) : '—'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {ESTADO_FACTURA[estadoNorm] ?? estadoNorm ?? '—'}
            <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* ✅ CAMBIO: solo campos que el FacturaDto realmente expone */}
          {[
            ['Cliente', f?.nombreCliente],
            ['Tipo pago', tipoPagoLabel(f)],
            ['Vence', f?.fechaVencimiento ? new Date(f.fechaVencimiento).toLocaleDateString('es-DO') : '—'],
            ['Comprobante', f?.comprobante || '—'],
          ].map(([l, v]) => (
            <div key={l} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{l}</p>
              <p className="font-semibold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {v || '—'}
              </p>
            </div>
          ))}
        </div>

        <div className="tbl-wrap mb-4">
          <table className="tbl">
            <thead>
              <tr>
                <th>Producto</th>
                <th className="text-right">Cant.</th>
                <th className="text-right">ITBIS</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {f?.detalles?.map((d, i) => (
                <tr key={i}>
                  {/* ✅ CAMBIO: productoDescripcion en vez de producto */}
                  <td className="font-medium">{d.productoDescripcion || '—'}</td>
                  <td className="text-right">{d.cantidad}</td>
                  {/* ✅ CAMBIO: itbis en vez de itbs */}
                  <td className="text-right">{fmt(d.itbis)}</td>
                  <td className="text-right font-semibold">{fmt(d.subTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-2 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
          {/* ✅ CAMBIO: itbis y montoPagado en vez de itbs y pagado */}
          {[
            ['Exento', fmt(f?.exento), false],
            ['Gravado', fmt(f?.gravado), false],
            ['ITBIS', fmt(f?.itbis), false],
            ['Total', fmt(f?.total), true],
            ['Pagado', fmt(f?.montoPagado), false],
            ['Pendiente', fmt(f?.saldoPendiente ?? ((f?.total || 0) - (f?.montoPagado || 0))), false],
          ].map(([l, v, bold]) => (
            <div key={l} className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{l}</span>
              <span
                className={`text-sm ${bold ? 'text-lg font-extrabold' : 'font-medium'}`}
                style={{ color: bold ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1">Cerrar</button>
          {/* ✅ CAMBIO: Editar solo se muestra si el endpoint existiera; como no existe, lo quito por defecto.
              Si decides implementar PUT en backend, vuelve a habilitar este bloque. */}
          {/*
          {esCuentaAbierta && (
            <button onClick={() => setEditando(true)} className="btn-secondary flex-1">
              <Pencil size={15} /> Editar
            </button>
          )}
          */}
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