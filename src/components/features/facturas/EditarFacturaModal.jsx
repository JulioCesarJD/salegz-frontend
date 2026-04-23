import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import { useActualizarFactura } from '../../../hooks/useFacturas';
import { fmt } from '../../../utils/format';
import { NumInput } from '../../common/NumInput';
import * as commonService from '../../../services/commonService';
import { PrecioSelectorModal } from '../../common/PrecioSelectorModal';

const TIPOS_PAGO = ['Efectivo', 'Tarjeta', 'Transferencia', 'Cheque', 'Crédito'];

export function EditarFacturaModal({ factura, onClose, onSaveSuccess }) {
    const [tipoPago, setTipoPago] = useState(factura.tipoPago || 'Efectivo');
    const [detalles, setDetalles] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [productos, setProductos] = useState([]);
    const [loadingProductos, setLoadingProductos] = useState(false);
    const [precioModal, setPrecioModal] = useState(null);
    

    const actualizarMutation = useActualizarFactura(() => {
        onSaveSuccess?.();
        onClose();
    });

    // Cargar detalles existentes de la factura
    useEffect(() => {
        if (factura?.detalles) {
            setDetalles(factura.detalles.map(d => ({
                productoId: d.productoId,
                producto: d.producto,
                cantidad: d.cantidad,
                precio: d.precio ?? (d.subTotal / d.cantidad),
                itbsPorc: d.itbsPorc ?? 0,
            })));
        }
    }, [factura]);

    // Buscar productos
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
                producto: p.descripcion,
                cantidad: 1,
                precio: precio,
                itbsPorc: p.itbsPorc ?? 0,
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

    const eliminarDetalle = (idx) => {
        setDetalles(prev => prev.filter((_, i) => i !== idx));
    };

    // Totales
    const subtotalBruto = detalles.reduce((s, d) => s + d.precio * d.cantidad, 0);
    const itbs = detalles.reduce((s, d) => s + (d.precio * d.cantidad * (d.itbsPorc / 100)), 0);
    const total = subtotalBruto + itbs;

    const handleGuardar = () => {
        if (detalles.length === 0) return alert('Agrega al menos un producto.');

        actualizarMutation.mutate({
            facturaId: factura.facturaId,
            data: {
                tipoPago,
                detalles: detalles.map(d => {
                    const base = d.precio * d.cantidad;
                    const itbs = base * (d.itbsPorc / 100);
                    return {
                        productoId: d.productoId,
                        cantidad: d.cantidad,
                        subTotal: base + itbs,   // SubTotal incluye ITBS (igual que CrearFactura)
                        itbs: itbs,
                        costo: d.costo ?? 0,
                        comision: d.comision ?? 0,
                    };
                }),
            }
        });
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box max-w-2xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                            Editar factura #{factura.facturaId}
                        </h2>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Cliente: <strong>{factura.nombreCliente}</strong>
                        </p>
                    </div>
                    <button onClick={onClose} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
                </div>

                {/* Tipo de pago */}
                <div className="mb-4">
                    <label className="label">Tipo de pago</label>
                    <div className="flex flex-wrap gap-2">
                        {TIPOS_PAGO.map(t => (
                            <button key={t} type="button"
                                onClick={() => setTipoPago(t)}
                                className="py-1.5 px-3 rounded-lg text-sm font-semibold border transition-all"
                                style={{
                                    backgroundColor: tipoPago === t ? 'var(--brand-light)' : 'var(--bg-card)',
                                    borderColor: tipoPago === t ? 'var(--brand)' : 'var(--border)',
                                    color: tipoPago === t ? 'var(--brand)' : 'var(--text-secondary)',
                                }}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

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
                    {/* Resultados */}
                    {(loadingProductos || productos.length > 0) && (
                        <div className="mt-1 rounded-lg border shadow-lg overflow-hidden"
                            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                            {loadingProductos
                                ? <p className="text-sm text-center py-3" style={{ color: 'var(--text-muted)' }}>Buscando...</p>
                                : productos.map(p => (
                                    <button
                                        key={p.productoId}
                                        type="button"
                                        className="w-full text-left px-4 py-3 hover:bg-[var(--bg-tertiary)] transition-colors"
                                        onClick={() => handleProductoClick(p)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                {p.descripcion}
                                            </span>

                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="text-xs px-2 py-0.5 rounded"
                                                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
                                                >
                                                    Stock: {p.cantidad}
                                                </span>

                                                <span className="text-sm font-bold" style={{ color: 'var(--brand)' }}>
                                                    {fmt(p.precio1)}
                                                </span>

                                                {p.precio2 > 0 && (
                                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                        · {fmt(p.precio2)}
                                                    </span>
                                                )}

                                                {p.precio3 > 0 && (
                                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                        · {fmt(p.precio3)}
                                                    </span>
                                                )}
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
                            ['ITBS', fmt(itbs)],
                            ['Total', fmt(total), true],
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
                        onSelect={(precio) => agregarProducto(precioModal, precio)}
                        onClose={() => setPrecioModal(null)}
                    />
                )}
            </div>
            
        </div>
    
);
}