import React, { useState } from 'react';
import { ArrowRightCircle, Printer } from 'lucide-react';
import { useCotizacion, useConvertirCotizacion } from '../../../hooks/useCotizaciones';
import { useEmpresaInfo } from '../../../hooks/useFacturas';
import { TIPO_COMPROBANTE, METODOS_PAGO } from '../../../constants/facturacion';
import { fmt } from '../../../utils/format';
import { printCotizacion } from '../../../utils/printFactura';

export function CotizacionDetalle({ cotizacionId, onClose }) {
  const { data: c, isLoading } = useCotizacion(cotizacionId);
  const { empresa, control, isLoading: loadE } = useEmpresaInfo();
  
  const convertirMutation = useConvertirCotizacion(() => onClose());

  const [confirmConvertir, setConfirmConvertir] = useState(false);
  const [tipoPago, setTipoPago] = useState('Efectivo');
  const [tipoComprobante, setTipoComprobante] = useState(1);

  const handlePrint = () => {
    if (c && empresa && control) printCotizacion(c, empresa, control);
  };

  if (isLoading || loadE) return (
    <div className="modal-overlay">
      <div className="modal-box max-w-2xl flex items-center justify-center py-12">
        <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Cotización #{c?.cotizacionId}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {new Date(c?.fecha).toLocaleDateString('es-DO', { dateStyle: 'full' })}
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            ['Cliente',  c?.nombreCliente || 'Consumidor Final'],
            ['Usuario',  c?.usuario],
            ['Total',    fmt(c?.total)],
            ['ITBIS',    fmt(c?.itbis)],
          ].map(([l, v]) => (
            <div key={l} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{l}</p>
              <p className="font-semibold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{v || '—'}</p>
            </div>
          ))}
        </div>

        {/* Detalles */}
        <div className="tbl-wrap mb-5">
          <table className="tbl">
            <thead>
              <tr>
                <th>Producto</th>
                <th className="text-right w-20">Cant.</th>
                <th className="text-right w-28">ITBIS</th>
                <th className="text-right w-32">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {c?.detalles?.map((d, i) => (
                <tr key={i}>
                  <td className="font-medium">{d.producto}</td>
                  <td className="text-right tabular-nums">{d.cantidad}</td>
                  <td className="text-right tabular-nums">{fmt(d.itbis)}</td>
                  <td className="text-right font-semibold tabular-nums">{fmt(d.subTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="space-y-2 border-t pt-4 mb-5" style={{ borderColor: 'var(--border)' }}>
          {[
            ['Subtotal', fmt((c?.total || 0) - (c?.itbis || 0)), false],
            ['ITBIS',    fmt(c?.itbis),                          false],
            ['Total',    fmt(c?.total),                          true],
          ].map(([l, v, bold]) => (
            <div key={l} className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{l}</span>
              <span className={`tabular-nums ${bold ? 'text-xl font-extrabold' : 'text-sm font-medium'}`}
                style={{ color: bold ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Convertir a factura */}
        {!confirmConvertir ? (
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1">Cerrar</button>
            <button onClick={handlePrint} className="btn-ghost flex-1 border" style={{ borderColor: 'var(--border)' }}>
              <Printer size={15} /> Imprimir
            </button>
            <button onClick={() => setConfirmConvertir(true)} className="btn-primary flex-1">
              <ArrowRightCircle size={15} /> Convertir
            </button>
          </div>
        ) : (
          <div className="border rounded-xl p-4 space-y-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-tertiary)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Configurar factura
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Tipo de pago</label>
                <select className="input" value={tipoPago} onChange={e => setTipoPago(e.target.value)}>
                  {METODOS_PAGO.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Comprobante</label>
                <select className="input" value={tipoComprobante} onChange={e => setTipoComprobante(parseInt(e.target.value))}>
                  {TIPO_COMPROBANTE.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setConfirmConvertir(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button
                disabled={convertirMutation.isPending}
                onClick={() => convertirMutation.mutate({
                  cotizacionId:    c.cotizacionId,
                  empresaId:       1,
                  tipoPago,
                  pagado:          0,
                  tarjeta:         tipoPago === 'Tarjeta',
                  tipoComprobante,
                })}
                className="btn-primary flex-1"
              >
                {convertirMutation.isPending ? 'Convirtiendo...' : `Crear factura por ${fmt(c?.total)}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
