import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../store/authStore';
import { useSearchClientes, useSearchProductos, useCreateFactura } from '../../../hooks/useFacturas';
import { useControles } from '../../../hooks/useControles';
import { fmt } from '../../../utils/format';
import { NumInput } from '../../common/NumInput';
import { localDate } from '../../../utils/date';

const TIPO_FACTURA = [
  { value: 0, label: 'Contado' },
  { value: 1, label: 'Crédito' },
];

/** La API usa: 1=Efectivo, 2=Cheque, 3=Tarjeta, 4=Transferencia. */
const METODO_PAGO_API = {
  Efectivo: 1,
  Cheque: 2,
  Tarjeta: 3,
  Transferencia: 4,
};

const METODOS = Object.keys(METODO_PAGO_API);

const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

export function NuevaFacturaModal({ onClose, onSaveSuccess }) {
  const { user } = useAuthStore();
  const { data: control } = useControles(user?.empresaId);

  const [clienteSearch, setClienteSearch] = useState('');
  const [productoSearch, setProductoSearch] = useState('');
  const [clienteSel, setClienteSel] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [esClienteGenerico, setEsClienteGenerico] = useState(false);

  const createMutation = useCreateFactura((res, variables) => {
    onSaveSuccess?.(res, variables);
  });

  const { register, handleSubmit, watch, control: formControl, setValue, reset } = useForm({
    defaultValues: {
      tipoFactura: 0,
      tipoPago: 'Efectivo',
      fechaVencimiento: '',
      detalles: [],
      nombreCliente: '',
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: formControl,
    name: 'detalles',
  });

  const { data: clientes = [] } = useSearchClientes(clienteSearch);
  const { data: productos = [] } = useSearchProductos(productoSearch);

  const tipoFactura = Number(watch('tipoFactura'));
  const esCredito = tipoFactura === 1;
  const nombreCliente = watch('nombreCliente');
  const detalles = watch('detalles') || [];

  const limpiarFormulario = () => {
    replace([]);
    reset({
      tipoFactura: 0,
      tipoPago: 'Efectivo',
      fechaVencimiento: '',
      detalles: [],
      nombreCliente: '',
    });
    setClienteSearch('');
    setProductoSearch('');
    setClienteSel(null);
    setConfirmCancel(false);
    setEsClienteGenerico(false);
  };

  const totales = detalles.reduce(
    (acc, d) => {
      const cantidad = parseFloat(d.cantidad || 0);
      const precio = parseFloat(d.precio || 0);
      const base = cantidad * precio;
      const exentoLinea = Boolean(d.exento);
      const itbisPct = parseFloat(d.itbis || 0);

      if (exentoLinea) {
        acc.exento += base;
      } else {
        acc.gravado += base;
        acc.itbis += base * (itbisPct / 100);
      }
      return acc;
    },
    { exento: 0, gravado: 0, itbis: 0 }
  );

  const total = totales.exento + totales.gravado + totales.itbis;

  const agregarProducto = (p) => {
    append({
      productoId: p.productoId,
      descripcion: p.descripcion,
      cantidad: '1',
      precio: String(p.precio1 || 0),
      itbis: Number(p.itbis) || 0,
      exento: Boolean(p.exento),
      descuento: 0,
    });
    setProductoSearch('');
  };

  const closeWithConfirm = () => {
    if (detalles.length > 0 || clienteSel || productoSearch || nombreCliente) {
      setConfirmCancel(true);
    } else {
      limpiarFormulario();
      onClose();
    }
  };

  const handleDiscard = () => {
    limpiarFormulario();
    setTimeout(() => onClose(), 0);
  };

  const handleClienteGenericoChange = (e) => {
    const checked = e.target.checked;
    setEsClienteGenerico(checked);
    if (checked) {
      setClienteSel(null);
      setClienteSearch('');
    }
    setValue('nombreCliente', '');
  };

  const submit = (data) => {
    if (fields.length === 0) {
      toast.error('Agrega al menos un producto');
      return;
    }

    const nombre =
      (data.nombreCliente || '').trim() ||
      clienteSel?.nombre ||
      'Consumidor Final';

    const diasCredito = Number(control?.limiteDiaPago) > 0 ? Number(control.limiteDiaPago) : 30;

    createMutation.mutate({
      clienteId: esClienteGenerico ? null : (clienteSel?.clienteId ?? null),
      nombreCliente: nombre,
      tipo: esCredito,
      metodoPago: esCredito ? null : (METODO_PAGO_API[data.tipoPago] ?? 1),
      fechaVencimiento: esCredito
        ? (data.fechaVencimiento || localDate(addDays(diasCredito)))
        : null,
      detalles: data.detalles.map((d) => ({
        productoId: d.productoId,
        cantidad: parseFloat(d.cantidad || 0),
        descuento: parseFloat(d.descuento || 0),
      })),
    });
  };

  return (
    <>
      <div className="modal-overlay" onClick={e => {
        if (confirmCancel) return;
        e.target === e.currentTarget && closeWithConfirm();
      }}>
        <div className="modal-box max-w-5xl overflow-y-auto max-h-[90vh]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Nueva factura</h2>
            <button type="button" onClick={() => !confirmCancel && closeWithConfirm()} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
          </div>

          <form onSubmit={handleSubmit(submit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Tipo de factura</label>
                <select className="input" {...register('tipoFactura', { valueAsNumber: true })}>
                  {TIPO_FACTURA.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Método de pago</label>
                <select className="input" disabled={esCredito} {...register('tipoPago')}>
                  {METODOS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {esCredito ? (
                <div>
                  <label className="label">Fecha de vencimiento</label>
                  <input type="date" className="input" {...register('fechaVencimiento')} />
                </div>
              ) : (
                <div className="hidden sm:block" />
              )}
            </div>

            {/* Cliente */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={esClienteGenerico}
                    onChange={handleClienteGenericoChange}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Cliente Genérico</span>
                </label>
              </div>

              {!esClienteGenerico ? (
                <div className="relative">
                  <label className="label">Buscar Cliente</label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input
                      className="input pl-8"
                      placeholder="Buscar por nombre o cédula..."
                      value={clienteSearch}
                      onChange={e => setClienteSearch(e.target.value)}
                    />
                  </div>

                  {clientes.length > 0 && (
                    <div className="absolute z-40 w-full mt-1 rounded-lg border shadow-lg max-h-60 overflow-y-auto"
                      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                      {clientes.map(c => (
                        <button
                          key={c.clienteId}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-tertiary)] transition-colors border-b last:border-b-0"
                          style={{ borderColor: 'var(--border)' }}
                          onClick={() => {
                            setClienteSel(c);
                            setClienteSearch('');
                            setValue('nombreCliente', c.nombre);
                          }}>
                          <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{c.nombre}</div>
                          {c.cedula && (
                            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                              Cédula/RNC: {c.cedula}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {clienteSel && (
                    <div className="mt-3 p-2 rounded-lg flex items-center justify-between"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {clienteSel.nombre}
                        </span>
                        {clienteSel.cedula && (
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            Cédula/RNC: {clienteSel.cedula}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setClienteSel(null);
                          setValue('nombreCliente', '');
                        }}
                        className="text-red-400 hover:text-red-600 text-lg leading-none">
                        ×
                      </button>
                    </div>
                  )}

                  {!clienteSel && (
                    <div className="mt-2">
                      <label className="label">O escribe nombre</label>
                      <input
                        className="input"
                        placeholder="Nombre del cliente"
                        {...register('nombreCliente')}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="label">Nombre del Cliente Genérico</label>
                  <input
                    className="input"
                    placeholder="Ej: Juan Pérez"
                    {...register('nombreCliente')}
                  />
                </div>
              )}
            </div>

            {/* Productos */}
            <div className="relative z-10">
              <label className="label">Agregar productos</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
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
                            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                              Stock: {p.cantidad}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                              {p.exento ? 'Exento' : `ITBIS ${p.itbis}%`}
                            </span>
                            <span className="text-sm font-bold" style={{ color: 'var(--brand)' }}>{fmt(p.precio1)}</span>
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
                      <th className="w-24">Cant.</th>
                      <th className="w-32">Precio</th>
                      <th className="w-28">ITBIS</th>
                      <th className="text-right w-32">Subtotal</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((f, i) => {
                      const cant = parseFloat(watch(`detalles.${i}.cantidad`) || 0);
                      const prec = parseFloat(watch(`detalles.${i}.precio`) || 0);
                      const base = cant * prec;
                      const itbisPct = Number(f.itbis) || 0;
                      const sub = f.exento ? base : base * (1 + itbisPct / 100);
                      return (
                        <tr key={f.id}>
                          <td className="font-medium text-sm">{f.descripcion}</td>
                          <td>
                            <NumInput className="input text-center py-1 px-2 text-sm" {...register(`detalles.${i}.cantidad`)} />
                          </td>
                          <td>
                            <NumInput className="input text-right py-1 px-2 text-sm" {...register(`detalles.${i}.precio`)} />
                          </td>
                          <td>
                            <span className={f.exento ? 'badge badge-gray' : 'badge badge-blue'}>
                              {f.exento ? 'Exento' : `${itbisPct}%`}
                            </span>
                          </td>
                          <td className="text-right font-semibold text-sm tabular-nums">{fmt(sub)}</td>
                          <td>
                            <button type="button" onClick={() => remove(i)} className="btn-ghost btn-icon btn-sm text-red-400 hover:text-red-600">×</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center py-10 rounded-xl border-2 border-dashed" style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Busca y agrega productos a la factura</p>
              </div>
            )}

            {fields.length > 0 && (
              <div className="flex justify-end">
                <div className="w-72 space-y-2">
                  {[
                    ['Exento', fmt(totales.exento)],
                    ['Gravado', fmt(totales.gravado)],
                    ['ITBIS', fmt(totales.itbis)],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                      <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t pt-2" style={{ borderColor: 'var(--border)' }}>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
                    <span className="text-2xl font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt(total)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={closeWithConfirm} className="btn-secondary flex-1">Cancelar</button>
              <button
                type="submit"
                disabled={createMutation.isPending || fields.length === 0}
                className="btn-primary flex-1"
              >
                {createMutation.isPending ? 'Guardando...' : esCredito ? 'Guardar factura' : 'Crear factura'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {confirmCancel && (
        <div
          className="modal-overlay z-[51]"
          onClick={e => {
            e.stopPropagation();
            e.target === e.currentTarget && setConfirmCancel(false);
          }}
        >
          <div className="modal-box max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>¿Descartar factura?</h3>
            <p className="text-sm mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>Se perderán todos los cambios.</p>
            <div className="flex gap-3">
              <button type="button" className="btn-secondary flex-1" onClick={() => setConfirmCancel(false)}>
                No, continuar
              </button>
              <button type="button" className="btn-danger flex-1" onClick={handleDiscard}>
                Sí, descartar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
