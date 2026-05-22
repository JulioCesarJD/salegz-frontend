import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../store/authStore';
import { useSearchClientes, useSearchProductos, useCreateFactura } from '../../../hooks/useFacturas';
import { TIPO_COMPROBANTE, METODOS_PAGO } from '../../../constants/facturacion';
import { fmt } from '../../../utils/format';
import { PrecioSelectorModal } from '../../common/PrecioSelectorModal';
import { NumInput } from '../../common/NumInput';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';

const TIPO_FACTURA = [
  { value: 0, label: 'Contado' },
  { value: 1, label: 'Crédito' },
];


export function NuevaFacturaModal({ onClose, onSaveSuccess }) {


  const limpiarFormulario = () => {
    // limpiar field array
    replace([]);

    // limpiar react-hook-form
    reset({
      tipoPago: 'Efectivo',
      tipoComprobante: 1,
      tipoFactura: 0,
      detalles: [],
      nombreCliente: '',
    });

    // limpiar estados
    setClienteSearch('');
    setProductoSearch('');
    setClienteSel(null);
    setPrecioModal(null);
    setConfirmCancel(false);
    setEsClienteGenerico(false);
    setFacturaCobro(null);
  };


  const { user } = useAuthStore();
  const [clienteSearch, setClienteSearch] = useState('');
  const [productoSearch, setProductoSearch] = useState('');
  const [clienteSel, setClienteSel] = useState(null);
  const [precioModal, setPrecioModal] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [esClienteGenerico, setEsClienteGenerico] = useState(false);

  const { data: configControl } = useQuery({
    queryKey: ['controles'],
    queryFn: () => api.get('/api/empresa/control').then(r => r.data),
  });

  const itbsPct = (parseFloat(configControl?.itbs || 18)) / 100;
  const [facturaCobro, setFacturaCobro] = useState(null);


  const createMutation = useCreateFactura((res, variables) => {
    onSaveSuccess?.(res, variables);
  });


  const { register, handleSubmit, watch, control, setValue, reset } = useForm({
    defaultValues: { tipoPago: 'Efectivo', tipoComprobante: 1, detalles: [], nombreCliente: '' },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'detalles'
  });
  const { data: clientes = [] } = useSearchClientes(clienteSearch);
  const { data: productos = [] } = useSearchProductos(productoSearch);
  const tipoComprobante = watch('tipoComprobante');
  const nombreCliente = watch('nombreCliente');

  const detalles = watch('detalles');

  const exento = detalles.reduce((s, d) => {
    const subtotal =
      parseFloat(d.cantidad || 0) *
      parseFloat(d.precio || 0);

    return Number(d.itbis || 0) === 0
      ? s + subtotal
      : s;
  }, 0);

  const gravado = detalles.reduce((s, d) => {
    const subtotal =
      parseFloat(d.cantidad || 0) *
      parseFloat(d.precio || 0);

    return Number(d.itbis || 0) > 0
      ? s + subtotal
      : s;
  }, 0);

  const itbs = detalles.reduce((s, d) => {
    const subtotal =
      parseFloat(d.cantidad || 0) *
      parseFloat(d.precio || 0);

    const pct = parseFloat(d.itbis || 0) / 100;

    return s + (subtotal * pct);
  }, 0);

  const total = exento + gravado + itbs;

  const handleProductoClick = (p) => {
    const precios = [p.precio1, p.precio2, p.precio3].filter(v => v > 0);
    if (precios.length > 1) {
      setPrecioModal(p);
      setProductoSearch('');
    } else {
      agregarProducto(p, p.precio1);
    }
  };

  const agregarProducto = (p, precio) => {
    append({
      productoId: p.productoId,
      descripcion: p.descripcion,
      cantidad: '1',
      precio: precio.toString(),
      itbis: 0,
      costo: 0,
      comision: 0
    });
    setProductoSearch('');
    setPrecioModal(null);
  };

  const closeWithConfirm = () => {
    if (detalles?.length > 0 || clienteSel || productoSearch || nombreCliente) {
      setConfirmCancel(true);
    } else {
      limpiarFormulario();
      onClose();
    }
  };

  const handleDiscard = () => {
    limpiarFormulario();

    // cerrar en el siguiente ciclo
    setTimeout(() => {
      onClose();
    }, 0);
  };


  const handleClienteGenericoChange = (e) => {
    const checked = e.target.checked;
    setEsClienteGenerico(checked);
    if (checked) {
      setClienteSel(null);
      setClienteSearch('');
      setValue('nombreCliente', '');
    } else {
      setValue('nombreCliente', '');
    }
  };

  const submit = (data) => {
    if (fields.length === 0) { toast.error('Agrega al menos un producto'); return; }

    // Validar según el tipo de comprobante
    if (parseInt(data.tipoComprobante) !== 1) { // 3 = Consumidor Final
      if (!esClienteGenerico && !clienteSel) {
        toast.error('Debe seleccionar un cliente');
        return;
      }
      if (esClienteGenerico && !data.nombreCliente.trim()) {
        toast.error('Debe ingresar el nombre del consumidor final');
        return;
      }
    }

    createMutation.mutate({
      empresaId: 1,
      clienteId: clienteSel?.clienteId || null,
      usuarioId: user?.usuarioId,

      tipoFactura: data.tipoFactura,

      nombreCliente: esClienteGenerico
        ? data.nombreCliente
        : (clienteSel?.nombre || data.nombreCliente || 'Consumidor Final'),

      rncCliente:
        !esConsumidorFinal &&
          !esClienteGenerico &&
          clienteSel?.cedula
          ? clienteSel.cedula
          : null,

      tipoPago: data.tipoPago,
      total,
      itbs,
      pagado: 0,
      exento,
      gravado,
      tarjeta: data.tipoPago === 'Tarjeta',
      tipoComprobante: parseInt(data.tipoComprobante),

      detalles: data.detalles.map(d => ({
        productoId: d.productoId,
        cantidad: parseFloat(d.cantidad || 0),
        subTotal:
          parseFloat(d.cantidad || 0) *
          parseFloat(d.precio || 0),

        itbs:
          parseFloat(d.cantidad || 0) *
          parseFloat(d.precio || 0) *
          (parseFloat(d.itbis || 0) / 100),

        costo: parseFloat(d.costo || 0),
        comision: parseFloat(d.comision || 0),
      })),
    }, {

    });
  };

  const esConsumidorFinal = parseInt(tipoComprobante) === 1;

  // Determinar si mostrar el input de RNC (no es consumidor final, no es genérico, hay cliente seleccionado y tiene cédula)
  const mostrarRNC =
    !esConsumidorFinal &&
    !esClienteGenerico &&
    clienteSel;


  return (
    <>
      <div className="modal-overlay" onClick={e => {
        if (confirmCancel) return;  // ← bloquea cuando el confirm está abierto
        e.target === e.currentTarget && closeWithConfirm();
      }}>

        <div className="modal-box max-w-5xl overflow-y-auto max-h-[90vh]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Nueva factura</h2>
            <button type="button" onClick={() => !confirmCancel && closeWithConfirm()} className="btn-ghost btn-icon text-lg leading-none rounded-lg">×</button>
          </div>

          <form onSubmit={handleSubmit(submit)} className="space-y-5">
            <div className="grid grid-cols-3 gap-4">

              <div>
                <label className="label">Tipo de factura</label>
                <select className="input" {...register('tipoFactura', { valueAsNumber: true })}>
                  {TIPO_FACTURA.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="relative z-30">
                <label className="label">Comprobante</label>
                <select className="input" {...register('tipoComprobante')}>
                  {TIPO_COMPROBANTE.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>


            </div>

            {/* Sección de Cliente - Solo mostrar si NO es Consumidor Final */}
            {parseInt(tipoComprobante) !== 3 && (
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

                    <div className="mt-3">

                      <label className="label text-sm">nombre del cliente</label>
                      {/* Mostrar cliente seleccionado */}
                      {clienteSel && (
                        <div className="mt-2 p-2 rounded-lg flex items-center justify-between"
                          style={{ backgroundColor: 'var(--bg-tertiary)' }}>

                          <div>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              {clienteSel.nombre}
                            </span>
                            {/* {clienteSel.cedula && (
                            <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                              Cédula: {clienteSel.cedula}
                            </span>
                          )} */}
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
                    </div>

                    {/* Input de RNC/Cédula no editable cuando hay cliente seleccionado */}
                    {mostrarRNC && (
                      <div className="mt-2">
                        <label className="label text-sm">Cédula / RNC</label>
                        <input
                          type="text"
                          className="input bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                          value={clienteSel.cedula}
                          disabled
                          readOnly
                        />
                      </div>
                    )}

                    {/* Input para nombre manual cuando no hay cliente seleccionado */}
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
            )}

            {/* Para Consumidor Final - solo un input simple */}
            {parseInt(tipoComprobante) === 3 && (
              <div>
                <label className="label">Nombre del Cliente</label>
                <input
                  className="input"
                  placeholder="Consumidor Final"
                  {...register('nombreCliente')}
                />
              </div>
            )}

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
                        onClick={() => handleProductoClick(p)}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{p.descripcion}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                              Stock: {p.cantidad}
                            </span>
                            <span className="text-sm font-bold" style={{ color: 'var(--brand)' }}>{fmt(p.precio1)}</span>
                            {p.precio2 > 0 && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· {fmt(p.precio2)}</span>}
                            {p.precio3 > 0 && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· {fmt(p.precio3)}</span>}
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
                      const itbis = Number(watch(`detalles.${i}.itbis`));
                      const sub = cant * prec * (1 + (itbis / 100));
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
                            <div className="flex items-center gap-2">
                              <select
                                className="input py-1 px-2 text-base w-[110px]"
                                value={watch(`detalles.${i}.itbis`) || 0}
                                onChange={(e) => {
                                  setValue(
                                    `detalles.${i}.itbis`,
                                    parseFloat(e.target.value || 0)
                                  );
                                }}
                              >
                                <option value={0}>Exento</option>

                                <option value={configControl?.itbs || 18}>
                                  {configControl?.itbs || 18}%
                                </option>
                              </select>

                              <NumInput
                                className="input w-[80px] py-1 px-2 text-sm"
                                value={watch(`detalles.${i}.itbis`) || 0}
                                disabled={Number(watch(`detalles.${i}.itbis`)) === 0}
                                onChange={(e) => {
                                  setValue(
                                    `detalles.${i}.itbis`,
                                    parseFloat(e.target.value || 0)
                                  );
                                }}
                              />
                            </div>
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
                  {[['Exento', fmt(exento)], ['Gravado', fmt(gravado)], ['ITBS (18%)', fmt(itbs)]].map(([l, v]) => (
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
                {createMutation.isPending
                  ? 'Guardando...'
                  : watch('tipoFactura') === 1
                    ? 'Guardar factura'
                    : 'Crear factura y cobrar →'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {precioModal && (
        <PrecioSelectorModal
          producto={precioModal}
          onSelect={precio => agregarProducto(precioModal, precio)}
          onClose={() => setPrecioModal(null)}
        />
      )}

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