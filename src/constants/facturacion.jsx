// Tipos de comprobantes fiscales
export const TIPO_COMPROBANTE_API = {
  B01: 1,
  B02: 2,
  B14: 3,
  B15: 4,
};

// Catálogo de comprobantes para el frontend
export const TIPO_COMPROBANTE = [
  {
    codigo: "B01",
    nombre: "Crédito Fiscal",
    value: "B01",
    valor: 1,
    label: "B01 · Crédito Fiscal",
    requiereRNC: true,
  },
  {
    codigo: "B02",
    nombre: "Consumidor Final",
    value: "B02",
    valor: 2,
    label: "B02 · Consumidor Final",
    requiereRNC: false,
  },
  {
    codigo: "B14",
    nombre: "Régimen Especial",
    value: "B14",
    valor: 3,
    label: "B14 · Régimen Especial",
    requiereRNC: true,
  },
  {
    codigo: "B15",
    nombre: "Gubernamental",
    value: "B15",
    valor: 4,
    label: "B15 · Gubernamental",
    requiereRNC: true,
  },
];

// Métodos de pago (enum API)
export const METODO_PAGO_API = {
  Efectivo: 1,
  Cheque: 2,
  Tarjeta: 3,
  Transferencia: 4,
};

// Métodos de pago para mostrar en pantalla
export const METODO_PAGO_UI = {
  1: "Efectivo",
  2: "Cheque",
  3: "Tarjeta",
  4: "Transferencia",
};

export const METODOS_PAGO = ["Efectivo", "Tarjeta", "Transferencia", "Cheque"];

// Estados de factura
export const ESTADO_FACTURA = {
  0: "Cancelada",
  1: "Activa",
  2: "Saldada",
  3: "Cuenta abierta",
};

// Tipos de factura
export const TIPO_FACTURA = [
  { value: 0, label: "Contado" },
  { value: 1, label: "Crédito" },
];
