import React, { useState, useEffect } from 'react';
import { Trash2, Search } from 'lucide-react';
import { useActualizarCotizacion } from '../../../hooks/useCotizaciones';
import { fmt } from '../../../utils/format';
import { NumInput } from '../../common/NumInput';
import * as commonService from '../../../services/commonService';
import { PrecioSelectorModal } from '../../common/PrecioSelectorModal';
import toast from 'react-hot-toast';

export function EditarCotizacionModal({ cotizacion, onClose, onSaveSuccess }) {
  // const [nombreCliente, setNombreCliente] = useState(cotizacion.nombreCliente || '');
  const [detalles, setDetalles]           = useState([]);
  const [busqueda, setBusqueda]           = useState('');
  const [productos, setProductos]         = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [precioModal, setPrecioModal]     = useState(null);

  const actualizarMutation = useActualizarCotizacion(() => {
    onSaveSuccess?.();
    onClose();
  });

  // Cargar detalles existentes
  useEffect(() => {
    if (cotizacion?.detalles) {
      setDetalles(cotizacion.detalles.map(d => ({
        productoId: d.productoId,
        producto:   d.producto ?? d.descripcion,
        cantidad:   d.cantidad,
        precio:     d.precio ?? (d.subTotal / d.cantidad),
        itbsPorc:   d.itbsPorc ?? 0,
        costo:      d.costo ?? 0,
        comision:   d.comision ?? 0,
      })));
    }
  }, [cotizacion]);

  // Búsqueda de productos con debounce
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
    if (precios.length > 1) {
      setPrecioModal(p);
      setBusqueda('');
      setProductos([]);
    } else {
      agregarProducto(p, p.precio1);
    }
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
        costo:      p.costo ?? 0,
        comision:   p.comision ?? 0,
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
  if (detalles.length === 0) return alert('Agrega al menos un producto.');

  actualizarMutation.mutate({
    cotizacionId: cotizacion.cotizacionId,
    data: {
      itbis:    itbs,
      total,
      detalles: detalles.map(d => {
        const base    = d.precio * d.cantidad;
        const itbsDet = base * (d.itbsPorc / 100);
        return {
          productoId: d.productoId,
          cantidad:   d.cantidad,
          subTotal:   base + itbsDet,
          itbs:       itbsDet,
          costo:      d.costo,
          comision:   d.comision,
        };
      }),
    },
  });
};

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Editar cotización #{cotizacion.cotizacionId}
            </h2>
          </div>
          <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
        </div>

        {/* Nombre cliente */}
        {/* <div className="mb-4">
          <label className="label">Cliente</label>
          <input
            className="input w-full"
            placeholder="Nombre del cliente"
            value={nombreCliente}
            onChange={e => setNombreCliente(e.target.value)}
          />
        </div> */}

        {/* Buscador de productos */}
        <div className="mb-4">
          <label className="label">Agregar producto</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              className="input pl-8 w-full"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
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
                        <span className="text-sm font-bold" style={{ color: 'var(--brand)' }}>
                          {fmt(p.precio1)}
                        </span>
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

        {/* Tabla de detalles */}
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
                  <td colSpan={5} className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
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

        {precioModal && (
          <PrecioSelectorModal
            producto={precioModal}
            onSelect={precio => agregarProducto(precioModal, precio)}
            onClose={() => setPrecioModal(null)}
          />
        )}
      </div>
    </div>
  );
}