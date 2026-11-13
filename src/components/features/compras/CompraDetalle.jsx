import React from 'react';
import { useCompra } from '../../../hooks/useCompras';
import { fmt } from '../../../utils/format';

const TIPO_COMPRA = { 0: 'Contado', 1: 'Crédito' };
const ESTADOS_COMPRA = {
  1: <span className="badge badge-yellow">Activo</span>,
  2: <span className="badge badge-green">Saldado</span>,
  3: <span className="badge badge-red">Cancelado</span>,
};

export function CompraDetalle({ compraId, onClose }) {
  const { data: c, isLoading } = useCompra(compraId);

  if (isLoading) return (
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
              Compra #{c?.compraId}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {c?.fecha ? new Date(c.fecha).toLocaleDateString('es-DO', { dateStyle: 'full' }) : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {ESTADOS_COMPRA[c?.estado] || <span className="badge badge-gray">{c?.estado ?? '—'}</span>}
            <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            ['Proveedor', c?.clienteId != null ? `Cliente #${c.clienteId}` : 'Sin proveedor'],
            ['Tipo pago', TIPO_COMPRA[c?.tipo] ?? '—'],
            ['ITBIS', fmt(c?.itbis)],
            ['Total', fmt(c?.total)],
          ].map(([l, v]) => (
            <div key={l} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{l}</p>
              <p className="font-semibold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{v || '—'}</p>
            </div>
          ))}
        </div>

        <div className="tbl-wrap mb-4">
          <table className="tbl table-fixed w-full">
            <thead>
              <tr>
                <th>Producto</th>
                <th className="w-20 text-right">Cant.</th>
                <th className="w-32 text-right">Precio unit.</th>
                <th className="w-32 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(c?.detalles || []).map((d, i) => (
                <tr key={d.compraDetalleId ?? i}>
                  <td className="font-medium">{d.productoDescripcion || '—'}</td>
                  <td className="text-start tabular-nums">{d.cantidad}</td>
                  <td className="text-start tabular-nums text-sm"
                    style={{ color: 'var(--text-secondary)' }}>
                    {d.cantidad ? fmt(d.subTotal / d.cantidad) : '—'}
                  </td>
                  <td className="text-start font-semibold tabular-nums">{fmt(d.subTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between border-t pt-4" style={{ borderColor: 'var(--border)' }}>
          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
          <span className="text-xl font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {fmt(c?.total)}
          </span>
        </div>

        <button onClick={onClose} className="btn-secondary w-full mt-5">Cerrar</button>
      </div>
    </div>
  );
}
