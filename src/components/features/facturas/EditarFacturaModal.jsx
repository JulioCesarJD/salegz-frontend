import React, { useState, useEffect } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { useActualizarFactura } from '../../../hooks/useFacturas';
import { useSearchClientes } from '../../../hooks/useFacturas';
import { fmt } from '../../../utils/format';
import { NumInput } from '../../common/NumInput';
import * as commonService from '../../../services/commonService';
import { PrecioSelectorModal } from '../../common/PrecioSelectorModal';
import { TIPO_COMPROBANTE, METODOS_PAGO } from '../../../constants/facturacion';

const TIPO_FACTURA = [
  { value: 0, label: 'Contado' },
  { value: 1, label: 'Crédito' },
];

export function EditarFacturaModal({ factura, onClose, onSaveSuccess }) {
  const [tipoPago,        setTipoPago]        = useState(factura.tipoPago        || 'Efectivo');
  const [tipoFactura,     setTipoFactura]     = useState(factura.tipoFactura     ?? 0);
  const [tipoComprobante, setTipoComprobante] = useState(factura.tipoComprobante ?? 1);
  const [clienteSel,      setClienteSel]      = useState(
    factura.clienteId ? { clienteId: factura.clienteId, nombre: factura.nombreCliente } : null
  );
  const [nombreCliente,   setNombreCliente]   = useState(factura.nombreCliente || '');
  const [clienteSearch,   setClienteSearch]   = useState('');

  const [detalles,        setDetalles]        = useState([]);
  const [busqueda,        setBusqueda]        = useState('');
  const [productos,       setProductos]       = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [precioModal,     setPrecioModal]     = useState(null);

  const { data: clientes = [] } = useSearchClientes(clienteSearch);

  const actualizarMutation = useActualizarFactura(() => {
    onSaveSuccess?.();
    onClose();
  });

  // Cargar detalles existentes
  useEffect(() => {
    if (factura?.detalles) {
      setDetalles(factura.detalles.map(d => ({
        productoId: d.productoId,
        producto:   d.producto,
        cantidad:   d.cantidad,
        precio:     d.precio ?? (d.subTotal / d.cantidad),
        itbsPorc:   d.itbsPorc ?? 0,
      })));
    }
  }, [factura]);

  // Buscar productos con debounce
  useEffect(() => {
    if (!busqueda.trim()) { setProductos([]); return; }
    const timer = setTimeout(async () => {
      setLoadingProductos(true);
      try {
        const res = await commonService.searchProductos(busqueda);
        setProductos(res);
      } catch { setProductos([]); }
      finally { setLoadingProductos(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const handleProductoClick = (p) => {
    const precios = [p.precio1, p.precio2, p.precio3].filter(v => v > 0);
    if (precios.length > 1) { setPrecioModal(p); setBusqueda(''); }
    else agregarProducto(p, p.precio1);
  };

  const agregarProducto = (p, precio) => {
    setDetalles(prev => {
      const idx = prev.findIndex(d => d.productoId === p.productoId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], cantidad: copy[idx].cantidad + 1 };
        return copy;
      }
      return [...prev, {
        productoId: p.productoId,
        producto:   p.descripcion,
        cantidad:   1,
        precio,
        itbsPorc:   p.itbsPorc ?? 0,
      }];
    });
    setBusqueda('');
    setProductos([]);
    setPrecioModal(null);
  };

  const cambiarCantidad = (idx, val) => {
    setDetalles(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], cantidad: parseFloat(val) || 0 };
      return copy;
    });
  };

  const eliminarDetalle = (idx) =>
    setDetalles(prev => prev.filter((_, i) => i !== idx));

  // Totales
  const subtotalBruto = detalles.reduce((s, d) => s + d.precio * d.cantidad, 0);
  const itbs          = detalles.reduce((s, d) => s + d.precio * d.cantidad * (d.itbsPorc / 100), 0);
  const total         = subtotalBruto + itbs;

  const handleGuardar = () => {
    if (detalles.length === 0) { alert('Agrega al menos un producto.'); return; }

    actualizarMutation.mutate({
      facturaId: factura.facturaId,
      data: {
        clienteId:      clienteSel?.clienteId || null,
        nombreCliente:  clienteSel?.nombre || nombreCliente || 'Consumidor Final',
        tipoPago,
        tipoFactura,
        tipoComprobante,
        detalles: detalles.map(d => {
          const base  = d.precio * d.cantidad;
          const itbsD = base * (d.itbsPorc / 100);
          return {
            productoId: d.productoId,
            cantidad:   d.cantidad,
            subTotal:   base + itbsD,
            itbs:       itbsD,
            costo:      d.costo    ?? 0,
            comision:   d.comision ?? 0,
          };
        }),
      },
    });
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-2xl overflow-y-auto max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Editar factura #{factura.facturaId}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Solo facturas en estado <strong>Cuenta Abierta</strong>
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
        </div>

        {/* Fila: Tipo Factura · Comprobante · Método de pago */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="label">Tipo de factura</label>
            <select className="input" value={tipoFactura}
              onChange={e => setTipoFactura(parseInt(e.target.value))}>
              {TIPO_FACTURA.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Comprobante</label>
            <select className="input" value={tipoComprobante}
              onChange={e => setTipoComprobante(parseInt(e.target.value))}>
              {TIPO_COMPROBANTE.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Método de pago</label>
            <select className="input" value={tipoPago}
              onChange={e => setTipoPago(e.target.value)}>
              {METODOS_PAGO.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Cliente */}
        <div className="mb-4">
          <label className="label">Cliente</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }} />
            <input className="input pl-8" placeholder="Buscar cliente..."
              value={clienteSearch}
              onChange={e => setClienteSearch(e.target.value)} />
          </div>

          {clientes.length > 0 && (
            <div className="mt-1 rounded-lg border shadow-lg max-h-40 overflow-y-auto"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
              {clientes.map(c => (
                <button key={c.clienteId} type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-tertiary)] transition-colors border-b last:border-b-0"
                  style={{ borderColor: 'var(--border)' }}
                  onClick={() => { setClienteSel(c); setClienteSearch(''); setNombreCliente(c.nombre); }}>
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{c.nombre}</div>
                  {c.cedula && (
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Cédula: {c.cedula}</div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Cliente seleccionado */}
          {clienteSel ? (
            <div className="mt-2 p-2 rounded-lg flex items-center justify-between"
              style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {clienteSel.nombre}
              </span>
              <button type="button"
                onClick={() => { setClienteSel(null); setNombreCliente(''); }}
                className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
            </div>
          ) : (
            <input className="input mt-2" placeholder="O escribe nombre del cliente"
              value={nombreCliente}
              onChange={e => setNombreCliente(e.target.value)} />
          )}
        </div>

        {/* Buscador productos */}
        <div className="mb-4">
          <label className="label">Agregar producto</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }} />
            <input className="input pl-8 w-full" placeholder="Buscar producto..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>
          {(loadingProductos || productos.length > 0) && (
            <div className="mt-1 rounded-lg border shadow-lg overflow-hidden"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
              {loadingProductos
                ? <p className="text-sm text-center py-3" style={{ color: 'var(--text-muted)' }}>Buscando...</p>
                : productos.map(p => (
                  <button key={p.productoId} type="button"
                    className="w-full text-left px-4 py-3 hover:bg-[var(--bg-tertiary)] transition-colors"
                    onClick={() => handleProductoClick(p)}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {p.descripcion}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded"
                          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                          Stock: {p.cantidad}
                        </span>
                        <span className="text-sm font-bold" style={{ color: 'var(--brand)' }}>{fmt(p.precio1)}</span>
                        {p.precio2 > 0 && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· {fmt(p.precio2)}</span>}
                        {p.precio3 > 0 && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· {fmt(p.precio3)}</span>}
                      </div>
                    </div>
                  </button>
                ))
              }
            </div>
          )}
        </div>

        {/* Tabla detalles */}
        <div className="tbl-wrap mb-4 max-h-60 overflow-y-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>Producto</th>
                <th className="w-24 text-right">Precio</th>
                <th className="w-24 text-center">Cant.</th>
                <th className="w-28 text-right">Subtotal</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {detalles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-sm"
                    style={{ color: 'var(--text-muted)' }}>
                    Sin productos — busca uno arriba
                  </td>
                </tr>
              ) : detalles.map((d, i) => (
                <tr key={i}>
                  <td className="font-medium text-sm">{d.producto}</td>
                  <td className="text-right text-sm tabular-nums">{fmt(d.precio)}</td>
                  <td className="text-center">
                    <NumInput
                      className="input text-center text-sm py-1 w-16 mx-auto"
                      value={d.cantidad}
                      onChange={e => cambiarCantidad(i, e.target.value)}
                    />
                  </td>
                  <td className="text-right font-semibold text-sm tabular-nums">
                    {fmt(d.precio * d.cantidad)}
                  </td>
                  <td>
                    <button onClick={() => eliminarDetalle(i)}
                      className="btn-ghost btn-icon btn-sm text-red-400">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        {detalles.length > 0 && (
          <div className="space-y-1.5 border-t pt-3 mb-5" style={{ borderColor: 'var(--border)' }}>
            {[
              ['Subtotal', fmt(subtotalBruto)],
              ['ITBS',     fmt(itbs)],
              ['Total',    fmt(total), true],
            ].map(([l, v, bold]) => (
              <div key={l} className="flex justify-between">
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{l}</span>
                <span className={bold ? 'text-lg font-extrabold' : 'text-sm font-medium'}
                  style={{ color: bold ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button
            onClick={handleGuardar}
            disabled={actualizarMutation.isPending || detalles.length === 0}
            className="btn-primary flex-1">
            {actualizarMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

      </div>

      {precioModal && (
        <PrecioSelectorModal
          producto={precioModal}
          onSelect={precio => agregarProducto(precioModal, precio)}
          onClose={() => setPrecioModal(null)}
        />
      )}
    </div>
  );
}