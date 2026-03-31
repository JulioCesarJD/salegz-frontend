import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import { useCreateCompra } from '../../../hooks/useCompras';
import { fmt } from '../../../utils/format';
import { NumInput } from '../../common/NumInput';

export function NuevaCompraModal({ onClose }) {
  const { user } = useAuthStore();
  const [proveedorSearch, setProveedorSearch] = useState('');
  const [productoSearch,  setProductoSearch]  = useState('');
  const [proveedorSel,    setProveedorSel]    = useState(null);
  const [confirmCancel,   setConfirmCancel]   = useState(false);

  const createMutation = useCreateCompra(() => onClose());

  const { register, handleSubmit, watch, control, formState: { isDirty } } = useForm({
    defaultValues: { tipoPago: 'Efectivo', estado: 0, detalles: [] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'detalles' });

  // Use localized query since it depends on api directly or migrate to Facturas hook if shared
  const { data: proveedores = [] } = useQuery({
    queryKey: ['proveedores-search', proveedorSearch],
    queryFn:  () => proveedorSearch.length >= 2 ? api.get(`/api/clientes/search?q=${proveedorSearch}`).then(r => r.data) : [],
    enabled: proveedorSearch.length >= 2,
  });

  const { data: productos = [] } = useQuery({
    queryKey: ['productos-search', productoSearch],
    queryFn:  () => productoSearch.length >= 1 ? api.get(`/api/productos/search?q=${productoSearch}`).then(r => r.data) : [],
    enabled: productoSearch.length >= 1,
  });

  const detalles = watch('detalles');
  const total = detalles.reduce((s, d) => s + parseFloat(d.cantidad||0) * parseFloat(d.costo||0), 0);

  const agregarProducto = (p) => {
    append({
      productoId:  p.productoId,
      descripcion: p.descripcion,
      cantidad:    1,
      costo:       p.costo || 0,
    });
    setProductoSearch('');
  };

  const closeWithConfirm = () => {
    if (isDirty || detalles?.length > 0 || proveedorSel || proveedorSearch || productoSearch) setConfirmCancel(true);
    else onClose();
  };

  const submit = (data) => {
    if (fields.length === 0) { toast.error('Agrega al menos un producto'); return; }
    createMutation.mutate({
      clienteId: proveedorSel?.clienteId || null,
      usuarioId: user?.usuarioId,
      total,
      tipoPago:  data.tipoPago,
      estado:    parseInt(data.estado),
      detalles:  data.detalles.map(d => ({
        productoId: d.productoId,
        cantidad:   parseFloat(d.cantidad),
        subTotal:   parseFloat(d.cantidad) * parseFloat(d.costo),
      })),
    });
  };

  return (
    <>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeWithConfirm()}>
        <div className="modal-box max-w-4xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Nueva compra</h2>
            <button onClick={closeWithConfirm} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
          </div>

          <form onSubmit={handleSubmit(submit)} className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <div className="relative">
                <label className="label">Proveedor (opcional)</label>
                {proveedorSel ? (
                  <div className="input flex items-center justify-between">
                    <span className="text-sm font-medium">{proveedorSel.nombre}</span>
                    <button type="button" onClick={() => setProveedorSel(null)} className="text-red-400 hover:text-red-600">×</button>
                  </div>
                ) : (
                  <>
                    <input className="input" placeholder="Buscar proveedor..."
                      value={proveedorSearch} onChange={e => setProveedorSearch(e.target.value)} />
                    {proveedores.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 rounded-lg border shadow-lg overflow-hidden"
                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        {proveedores.map(p => (
                          <button key={p.clienteId} type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-tertiary)]"
                            onClick={() => { setProveedorSel(p); setProveedorSearch(''); }}>
                            {p.nombre}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="label">Tipo de pago</label>
                <select className="input" {...register('tipoPago')}>
                  {['Efectivo','Tarjeta','Transferencia','Cheque','Crédito'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Estado</label>
                <select className="input" {...register('estado')}>
                  <option value={0}>Contado</option>
                  <option value={1}>Crédito</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Agregar productos</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }} />
                <input className="input pl-8" placeholder="Buscar por nombre o código..."
                  value={productoSearch} onChange={e => setProductoSearch(e.target.value)} />
                {productos.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 rounded-lg border shadow-lg overflow-hidden"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    {productos.map(p => (
                      <button key={p.productoId} type="button"
                        className="w-full text-left px-4 py-3 hover:bg-[var(--bg-tertiary)] transition-colors"
                        onClick={() => agregarProducto(p)}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{p.descripcion}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded"
                              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                              Stock: {p.cantidad}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              Costo: <strong>{fmt(p.costo)}</strong>
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {fields.length > 0 ? (
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th className="w-28">Cantidad</th>
                      <th className="w-36">Costo unit.</th>
                      <th className="text-right w-36">Subtotal</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((f, i) => {
                      const cant  = parseFloat(watch(`detalles.${i}.cantidad`) || 0);
                      const costo = parseFloat(watch(`detalles.${i}.costo`)    || 0);
                      return (
                        <tr key={f.id}>
                          <td className="font-medium text-sm">{f.descripcion}</td>
                          <td>
                            <NumInput
                              className="input text-center py-1.5 px-2 text-sm w-24"
                              {...register(`detalles.${i}.cantidad`)} />
                          </td>
                          <td>
                            <NumInput
                              className="input text-right py-1.5 px-2 text-sm w-32"
                              {...register(`detalles.${i}.costo`)} />
                          </td>
                          <td className="text-right font-semibold text-sm tabular-nums">
                            {fmt(cant * costo)}
                          </td>
                          <td>
                            <button type="button" onClick={() => remove(i)}
                              className="btn-ghost btn-icon btn-sm text-red-400 hover:text-red-600">×</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center py-10 rounded-xl border-2 border-dashed"
                style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Busca y agrega productos a la compra
                </p>
              </div>
            )}

            {fields.length > 0 && (
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                    <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Total</span>
                    <span className="text-2xl font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                      {fmt(total)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={closeWithConfirm} className="btn-secondary flex-1">Cancelar</button>
              <button type="submit" disabled={createMutation.isPending || fields.length === 0} className="btn-primary flex-1">
                {createMutation.isPending ? 'Guardando...' : 'Registrar compra'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {confirmCancel && (
        <div className="modal-overlay">
          <div className="modal-box max-w-sm">
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>¿Descartar compra?</h3>
            <p className="text-sm mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>Se perderán todos los cambios.</p>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setConfirmCancel(false)}>No, continuar</button>
              <button className="btn-danger flex-1" onClick={onClose}>Sí, descartar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
