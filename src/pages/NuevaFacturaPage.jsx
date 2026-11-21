import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ArrowLeft,
  FilePlus2,
  UserRound,
  ShoppingCart,
  Trash2,
  X,
  CalendarDays,
  CreditCard,
  Receipt,
  Package,
  CheckCircle2,
  UserRoundPlus,
  Wallet,
  FileText,
} from "lucide-react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import {
  useSearchClientes,
  useSearchProductos,
  useCreateFactura,
} from "../hooks/useFacturas";
import { useControles } from "../hooks/useControles";
import { fmt } from "../utils/format";
import { NumInput } from "../components/common/NumInput";
import { localDate } from "../utils/date";
import { CobroModal } from "../components/features/facturas/CobroModal";
import * as facturasService from "../services/facturasService";

import {
  TIPO_FACTURA,
  TIPO_COMPROBANTE,
  METODO_PAGO_API,
  METODOS_PAGO,
} from "../constants/facturacion";

const DEFAULTS = {
  tipoFactura: 0,
  tipoPago: "Efectivo",
  tipoComprobante: "B02",
  fechaVencimiento: "",
  detalles: [],
  nombreCliente: "",
};

const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

const calcLinea = (d) => {
  const cantidad = parseFloat(d.cantidad || 0) || 0;
  const precio = parseFloat(d.precio || 0) || 0;
  const bruto = cantidad * precio;
  const descuento = parseFloat(d.descuento || 0) || 0;
  const subTotal = bruto - descuento;
  const exento = Boolean(d.exento);
  const itbis = exento ? 0 : subTotal * ((Number(d.itbis) || 0) / 100);

  return { cantidad, precio, bruto, descuento, subTotal, exento, itbis };
};

const Card = ({ children, className = "" }) => (
  <section
    className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl ${className}`}
  >
    {children}
  </section>
);

const SectionTitle = ({ icon: Icon, title, description, action }) => (
  <div className="flex items-center justify-between gap-3 mb-5">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-10 h-10 shrink-0 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
        <Icon size={19} />
      </div>
      <div className="min-w-0">
        <h2 className="font-semibold text-sm sm:text-base text-[var(--text-primary)]">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
    {action}
  </div>
);

export function NuevaFacturaPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: control } = useControles(user?.empresaId);

  const [clienteSearch, setClienteSearch] = useState("");
  const [productoSearch, setProductoSearch] = useState("");
  const [clienteSel, setClienteSel] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [esClienteGenerico, setEsClienteGenerico] = useState(false);
  const [facturaCreada, setFacturaCreada] = useState(null);
  const [abriendoCobro, setAbriendoCobro] = useState(false);

  const createMutation = useCreateFactura((res) => {
    toast.success("Factura creada correctamente");

    // Si es crédito no hay cobro inmediato
    if (res?.tipo) {
      navigate("/facturas");
      return;
    }

    // Cargar la factura completa y abrir el modal de cobro
    const facturaId = res?.facturaId ?? res?.id;
    if (facturaId) {
      setAbriendoCobro(true);
      facturasService
        .getFacturaById(facturaId)
        .then((data) => setFacturaCreada(data))
        .catch(() => {
          toast.error("No se pudo abrir el cobro");
          navigate("/facturas");
        })
        .finally(() => setAbriendoCobro(false));
    } else {
      navigate("/facturas");
    }
  });

  const {
    register,
    handleSubmit,
    watch,
    control: formControl,
    setValue,
    reset,
  } = useForm({ defaultValues: DEFAULTS });

  const { fields, append, remove, replace } = useFieldArray({
    control: formControl,
    name: "detalles",
  });

  const { data: clientes = [] } = useSearchClientes(clienteSearch);
  const { data: productos = [] } = useSearchProductos(productoSearch);

  const esCredito = Number(watch("tipoFactura")) === 1;
  const nombreCliente = watch("nombreCliente");
  const detalles = watch("detalles") || [];
  const tipoComprobanteActual = watch("tipoComprobante") || "B02";

  const comprobanteActual = TIPO_COMPROBANTE.find(
    (tipo) => tipo.codigo === tipoComprobanteActual,
  );

  const requiereRNC = comprobanteActual?.requiereRNC ?? false;

  const limpiarFormulario = () => {
    replace([]);
    reset(DEFAULTS);
    setClienteSearch("");
    setProductoSearch("");
    setClienteSel(null);
    setConfirmCancel(false);
    setEsClienteGenerico(false);
  };

  const hayDatos =
    fields.length > 0 ||
    clienteSel ||
    productoSearch ||
    clienteSearch ||
    nombreCliente;

  const handleBack = () => {
    if (hayDatos) {
      setConfirmCancel(true);
    } else {
      navigate(-1);
    }
  };

  const handleDiscard = () => {
    limpiarFormulario();
    navigate(-1);
  };

  const totales = detalles.reduce(
    (acc, d) => {
      const l = calcLinea(d);

      if (l.exento) {
        acc.exento += l.subTotal;
      } else {
        acc.gravado += l.subTotal;
        acc.itbis += l.itbis;
      }

      return acc;
    },
    { exento: 0, gravado: 0, itbis: 0 },
  );

  const subtotal = totales.exento + totales.gravado;
  const total = subtotal + totales.itbis;

  const agregarProducto = (p) => {
    const esServicio = Boolean(p.servicios);
    const stock = Number(p.cantidad) || 0;

    if (!esServicio && stock < 1) {
      toast.error("Este producto no tiene stock disponible");
      return;
    }

    if (fields.some((f) => Number(f.productoId) === Number(p.productoId))) {
      toast.error("El producto ya está en la factura");
      setProductoSearch("");
      return;
    }

    append({
      productoId: p.productoId,
      descripcion: p.descripcion,
      cantidad: "1",
      precio: String(p.precio1 || 0),
      itbis: Number(p.itbis) || 0,
      exento: Boolean(p.exento),
      descuento: "0",
      stock,
      servicio: esServicio,
    });

    setProductoSearch("");
  };

  const handleClienteGenericoChange = (e) => {
    const checked = e.target.checked;

    setEsClienteGenerico(checked);

    if (checked) {
      setClienteSel(null);
      setClienteSearch("");
    }

    setValue("nombreCliente", "");
  };

  const submit = (data) => {
    if (fields.length === 0) {
      toast.error("Agrega al menos un producto");
      return;
    }

    if (requiereRNC && !clienteSel?.cedula) {
      toast.error(
        `El comprobante ${tipoComprobanteActual} requiere un cliente con RNC/Cédula`,
      );
      return;
    }

    if (esCredito && !clienteSel) {
      toast.error("Una factura a crédito requiere seleccionar un cliente");
      return;
    }

    for (const d of data.detalles || []) {
      const l = calcLinea(d);

      if (!d.productoId || l.cantidad <= 0) {
        toast.error(`Cantidad inválida en "${d.descripcion}"`);
        return;
      }

      if (!d.servicio && l.cantidad > (Number(d.stock) || 0)) {
        toast.error(
          `Stock insuficiente para "${d.descripcion}" (disponible: ${d.stock})`,
        );
        return;
      }

      if (l.descuento < 0 || l.descuento > l.bruto) {
        toast.error(
          `El descuento de "${d.descripcion}" debe estar entre 0 y ${fmt(l.bruto)}`,
        );
        return;
      }
    }

    const detallesPayload = (data.detalles || []).map((d) => ({
      productoId: Number(d.productoId),
      cantidad: parseFloat(d.cantidad || 0),
      descuento: parseFloat(d.descuento || 0) || 0,
    }));

    const nombre =
      (data.nombreCliente || "").trim() ||
      clienteSel?.nombre ||
      "Consumidor Final";

    const diasCredito =
      Number(control?.limiteDiaPago) > 0 ? Number(control.limiteDiaPago) : 30;

    const payload = {
      clienteId: clienteSel?.clienteId ?? null,
      nombreCliente: nombre,
      tipo: esCredito,
      tipoComprobante: comprobanteActual?.valor ?? null,
      metodoPago: esCredito ? null : (METODO_PAGO_API[data.tipoPago] ?? 1),
      fechaVencimiento: esCredito
        ? data.fechaVencimiento || localDate(addDays(diasCredito))
        : null,
      detalles: detallesPayload,
    };

    if (import.meta.env.DEV) {
      console.debug("[POST /api/facturas] payload:", payload);
    }

    createMutation.mutate(payload);
  };

  const inputClass =
    "input w-full min-w-0 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all";

  const submitDisabled =
    createMutation.isPending || abriendoCobro || fields.length === 0;

  const submitLabel = createMutation.isPending
    ? "Guardando..."
    : abriendoCobro
      ? "Abriendo cobro..."
      : esCredito
        ? "Guardar factura"
        : "Crear factura";

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-7 py-5 pb-28">
      {/* HEADER */}
      <header className="flex flex-wrap items-center justify-between gap-4 mb-7">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--border)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="page-title">Nueva factura</h1>
              <span className="hidden sm:inline-flex text-[10px] font-semibold px-2 py-1 rounded-md bg-green-500/10 text-[#15803d]">
                NUEVA
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Registra una venta y genera un comprobante fiscal.
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Receipt size={16} />
          <span>Facturación / Nueva factura</span>
        </div>
      </header>

      <form onSubmit={handleSubmit(submit)}>
        <div className="grid grid-cols-1 gap-5">
          {/* COLUMNA PRINCIPAL */}
          <div className="space-y-5 min-w-0">
            {/* CONFIGURACIÓN */}
            <Card className="p-4 sm:p-5">
              <SectionTitle
                icon={FileText}
                title="Configuración de factura"
                description="Define las condiciones de esta venta."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="label">Tipo de factura</label>
                  <select
                    className={inputClass}
                    {...register("tipoFactura", { valueAsNumber: true })}
                  >
                    {TIPO_FACTURA.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Comprobante (NCF)</label>
                  <select
                    className={inputClass}
                    {...register("tipoComprobante")}
                  >
                    {TIPO_COMPROBANTE.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Método de pago</label>
                  <select
                    className={inputClass}
                    disabled={esCredito}
                    {...register("tipoPago")}
                  >
                    {METODOS_PAGO.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {esCredito && (
                  <div>
                    <label className="label">Fecha de vencimiento</label>
                    <input
                      type="date"
                      className={inputClass}
                      {...register("fechaVencimiento")}
                    />
                  </div>
                )}
              </div>

              {requiereRNC && (
                <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600">
                  <Receipt size={17} className="mt-0.5 shrink-0" />
                  <p className="text-xs">
                    Este comprobante requiere un cliente con RNC o cédula.
                  </p>
                </div>
              )}
            </Card>

            {/* CLIENTE */}
            <Card className="p-4 sm:p-5">
              <SectionTitle
                icon={UserRound}
                title="Cliente"
                description="Selecciona el cliente de la factura."
              />

              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-[#15803d]">
                  <input
                    type="checkbox"
                    checked={esClienteGenerico}
                    onChange={handleClienteGenericoChange}
                    disabled={esCredito || requiereRNC}
                    className="w-4 h-4 rounded accent-green-600"
                  />
                  Consumidor final / Cliente genérico
                </label>

                {esCredito && (
                  <span className="text-xs text-amber-500">
                    <CreditCard size={13} className="inline mr-1" />
                    Cliente obligatorio para crédito
                  </span>
                )}
              </div>

              {!esClienteGenerico || esCredito ? (
                <>
                  <label className="label">
                    Buscar cliente
                    {requiereRNC && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>

                  <div className="relative">
                    <Search
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />

                    <input
                      className={`${inputClass} pl-10`}
                      placeholder="Nombre, cédula o RNC del cliente..."
                      value={clienteSearch}
                      onChange={(e) => setClienteSearch(e.target.value)}
                    />

                    {clientes.length > 0 && (
                      <div className="absolute z-40 top-full left-0 right-0 mt-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xl max-h-64 overflow-y-auto">
                        {clientes.map((c) => (
                          <button
                            key={c.clienteId}
                            type="button"
                            className="w-full text-left px-4 py-3 hover:bg-[var(--bg-tertiary)] border-b last:border-0 border-[var(--border)] transition-colors"
                            onClick={() => {
                              setClienteSel(c);
                              setClienteSearch("");
                              setValue("nombreCliente", c.nombre);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                                <UserRound size={17} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[var(--text-primary)]">
                                  {c.nombre}
                                </p>
                                <p className="text-xs text-[var(--text-muted)]">
                                  {c.cedula || "Sin cédula/RNC"}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {clienteSel ? (
                    <div className="mt-4 p-4 rounded-xl bg-green-500/5 border border-green-500/20 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                          <CheckCircle2 size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                            {clienteSel.nombre}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            Cédula/RNC: {clienteSel.cedula || "No registrado"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setClienteSel(null);
                          setValue("nombreCliente", "");
                        }}
                        className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500"
                        aria-label="Quitar cliente"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    !esCredito && (
                      <div className="mt-4">
                        <label className="label">
                          O escribe el nombre del cliente
                        </label>
                        <input
                          className={inputClass}
                          placeholder="Nombre del cliente..."
                          {...register("nombreCliente")}
                        />
                      </div>
                    )
                  )}
                </>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-4 items-end">
                  <div>
                    <label className="label">Nombre del cliente genérico</label>
                    <input
                      className={inputClass}
                      placeholder="Ej: Juan Pérez"
                      {...register("nombreCliente")}
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] text-xs text-[var(--text-muted)]">
                    <UserRoundPlus size={17} className="mb-1 text-green-500" />
                    Cliente sin registro asociado.
                  </div>
                </div>
              )}
            </Card>

            {/* PRODUCTOS */}
            <Card className="p-4 sm:p-5">
              <SectionTitle
                icon={ShoppingCart}
                title="Productos y servicios"
                description={`${fields.length} ${fields.length === 1 ? "artículo agregado" : "artículos agregados"}`}
              />

              <div className="relative z-20 mb-5">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  className={`${inputClass} pl-11 h-12`}
                  placeholder="Buscar producto por nombre o código..."
                  value={productoSearch}
                  onChange={(e) => setProductoSearch(e.target.value)}
                />

                {productos.length > 0 && (
                  <div className="absolute z-30 top-full left-0 right-0 mt-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xl overflow-hidden max-h-72 overflow-y-auto">
                    {productos.map((p) => (
                      <button
                        key={p.productoId}
                        type="button"
                        className="w-full flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 px-4 py-3 text-left border-b last:border-0 border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors"
                        onClick={() => agregarProducto(p)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                            <Package size={17} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                              {p.descripcion}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                              {p.servicios
                                ? "Servicio"
                                : `Stock disponible: ${p.cantidad}`}
                              {" · "}
                              {p.exento ? "Exento" : `ITBIS ${p.itbis}%`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-sm text-green-500">
                            {fmt(p.precio1)}
                          </span>
                          <span className="w-7 h-7 rounded-lg bg-green-500 text-white flex items-center justify-center">
                            +
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {fields.length > 0 ? (
                <>
                  {/* TABLA ESCRITORIO */}
                  <div className="hidden md:block overflow-x-auto rounded-xl border border-[var(--border)]">
                    <table className="w-full text-sm">
                      <thead className="bg-[var(--bg-tertiary)]">
                        <tr className="text-left text-xs text-[var(--text-muted)]">
                          <th className="px-4 py-3 font-semibold">Producto</th>
                          <th className="px-3 py-3 w-24 text-center">Cant.</th>
                          <th className="px-3 py-3 w-28 text-right">Precio</th>
                          <th className="px-3 py-3 w-28">Descuento</th>
                          <th className="px-3 py-3 w-24 text-center">ITBIS</th>
                          <th className="px-4 py-3 w-32 text-right">
                            Subtotal
                          </th>
                          <th className="w-12"></th>
                        </tr>
                      </thead>

                      <tbody>
                        {fields.map((f, i) => {
                          const l = calcLinea(detalles[i] || f);
                          const itbisPct = Number(f.itbis) || 0;

                          return (
                            <tr
                              key={f.id}
                              className="border-t border-[var(--border)] hover:bg-[var(--bg-tertiary)]/50 transition-colors"
                            >
                              <td className="px-4 py-4">
                                <p className="font-semibold text-[var(--text-primary)]">
                                  {f.descripcion}
                                </p>
                                <p className="text-xs text-[var(--text-muted)] mt-1">
                                  {f.servicio
                                    ? "Servicio"
                                    : `Stock: ${f.stock}`}
                                </p>
                              </td>

                              <td className="px-2 py-3">
                                <Controller
                                  control={formControl}
                                  name={`detalles.${i}.cantidad`}
                                  render={({ field }) => (
                                    <NumInput
                                      className="input w-full text-center px-1 py-2 text-sm"
                                      value={field.value ?? ""}
                                      onChange={(e) =>
                                        field.onChange(e.target.value)
                                      }
                                      onBlur={field.onBlur}
                                      ref={field.ref}
                                    />
                                  )}
                                />
                              </td>

                              <td className="px-3 py-3 text-right tabular-nums text-[var(--text-secondary)]">
                                {fmt(l.precio)}
                              </td>

                              <td className="px-2 py-3">
                                <Controller
                                  control={formControl}
                                  name={`detalles.${i}.descuento`}
                                  render={({ field }) => (
                                    <NumInput
                                      className="input w-full px-2 py-2 text-right text-sm"
                                      value={field.value ?? ""}
                                      onChange={(e) =>
                                        field.onChange(e.target.value)
                                      }
                                      onBlur={field.onBlur}
                                      ref={field.ref}
                                    />
                                  )}
                                />
                              </td>

                              <td className="px-3 py-3 text-center">
                                <span
                                  className={`inline-flex px-2 py-1 rounded-md text-[10px] font-semibold ${
                                    f.exento
                                      ? "bg-gray-500/10 text-gray-500"
                                      : "bg-blue-500/10 text-blue-500"
                                  }`}
                                >
                                  {f.exento ? "Exento" : `${itbisPct}%`}
                                </span>
                              </td>

                              <td className="px-4 py-3 text-right font-bold tabular-nums text-[var(--text-primary)]">
                                {fmt(l.subTotal + l.itbis)}
                              </td>

                              <td className="px-2 py-3">
                                <button
                                  type="button"
                                  onClick={() => remove(i)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                  aria-label="Eliminar producto"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* TARJETAS MÓVILES */}
                  <div className="md:hidden space-y-3">
                    {fields.map((f, i) => {
                      const l = calcLinea(detalles[i] || f);

                      return (
                        <div
                          key={f.id}
                          className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)]/40"
                        >
                          <div className="flex justify-between gap-3 mb-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-[var(--text-primary)]">
                                {f.descripcion}
                              </p>
                              <p className="text-xs text-[var(--text-muted)] mt-1">
                                {fmt(l.precio)} por unidad
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => remove(i)}
                              className="shrink-0 p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>

                          <div>
                            <label className="label">Cantidad</label>
                            <Controller
                              control={formControl}
                              name={`detalles.${i}.cantidad`}
                              render={({ field }) => (
                                <NumInput
                                  className={inputClass}
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                  onBlur={field.onBlur}
                                  ref={field.ref}
                                />
                              )}
                            />
                          </div>
                          <div>
                            <label className="label">Descuento</label>
                            <Controller
                              control={formControl}
                              name={`detalles.${i}.descuento`}
                              render={({ field }) => (
                                <NumInput
                                  className={inputClass}
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                  onBlur={field.onBlur}
                                  ref={field.ref}
                                />
                              )}
                            />
                          </div>

                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-[var(--border)]">
                            <span className="text-xs text-[var(--text-muted)]">
                              {f.exento ? "Exento" : `ITBIS ${f.itbis}%`}
                            </span>
                            <span className="font-bold text-sm text-[var(--text-primary)]">
                              {fmt(l.subTotal + l.itbis)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="py-12 px-4 flex flex-col items-center justify-center text-center rounded-xl border-2 border-dashed border-[var(--border)]">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-3">
                    <ShoppingCart size={25} />
                  </div>
                  <p className="font-semibold text-sm text-[var(--text-primary)]">
                    No hay productos agregados
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Busca un producto o servicio para comenzar.
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* RESUMEN E INFORMACIÓN DE VENTA (UNO DEBAJO DEL OTRO) */}
          <aside className="space-y-5">
            <Card className="p-5">
              <SectionTitle
                icon={Wallet}
                title="Resumen de factura"
                description="Detalle de importes."
              />

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-muted)]">Artículos</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {fields.length}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-muted)]">Subtotal</span>
                  <span className="font-medium text-[var(--text-primary)] tabular-nums">
                    {fmt(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-muted)]">Exento</span>
                  <span className="font-medium text-[var(--text-primary)] tabular-nums">
                    {fmt(totales.exento)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-muted)]">Gravado</span>
                  <span className="font-medium text-[var(--text-primary)] tabular-nums">
                    {fmt(totales.gravado)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-muted)]">ITBIS</span>
                  <span className="font-medium text-[var(--text-primary)] tabular-nums">
                    {fmt(totales.itbis)}
                  </span>
                </div>

                <div className="border-t border-[var(--border)] pt-4">
                  <div className="rounded-xl bg-green-500/5 border border-green-500/15 p-4">
                    <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Total a pagar
                    </p>
                    <p className="text-3xl font-extrabold text-green-500 mt-2 tabular-nums break-all">
                      {fmt(total)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Pesos dominicanos (RD$)
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Botones de acción: visibles solo en desktop */}
            <div className="hidden xl:flex flex-wrap gap-3 justify-end">
              <button
                type="button"
                onClick={handleBack}
                className="btn-secondary flex items-center justify-center gap-2 py-3 px-6 rounded-xl"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={submitDisabled}
                className="btn-primary flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl shadow-lg shadow-green-500/15 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                }}
              >
                {submitLabel}
              </button>
            </div>
          </aside>
        </div>

        {/* ACCIONES MÓVILES Y TABLET */}
        <div className="xl:hidden fixed bottom-0 left-0 right-0 z-30 px-3 sm:px-6 py-3 border-t border-[var(--border)] bg-[var(--bg-card)]/95 backdrop-blur-md">
          <div className="max-w-[1600px] mx-auto flex items-center gap-3">
            <div className="hidden sm:block min-w-0 mr-auto">
              <p className="text-xs text-[var(--text-muted)]">Total</p>
              <p className="text-lg font-bold text-green-500 tabular-nums">
                {fmt(total)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleBack}
              className="btn-secondary flex-1 sm:flex-none"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={submitDisabled}
              className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
              }}
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </form>

      {/* CONFIRMAR DESCARTE */}
      {confirmCancel && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setConfirmCancel(false);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
              <Trash2 size={22} />
            </div>

            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              ¿Descartar factura?
            </h3>

            <p className="text-sm text-[var(--text-muted)] mt-2 mb-6">
              Tienes información sin guardar. Si sales ahora, perderás todos los
              cambios realizados.
            </p>

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                className="btn-secondary flex-1"
                onClick={() => setConfirmCancel(false)}
              >
                Continuar editando
              </button>

              <button
                type="button"
                className="btn-danger flex-1"
                onClick={handleDiscard}
              >
                Descartar factura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE COBRO AL CREAR FACTURA */}
      {facturaCreada && (
        <CobroModal
          factura={facturaCreada}
          onClose={() => {
            setFacturaCreada(null);
            navigate("/facturas");
          }}
        />
      )}
    </div>
  );
}
