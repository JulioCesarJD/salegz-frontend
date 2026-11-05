/** Valores tal como los devuelve y espera la API. */

export const TipoUsuario = Object.freeze({
  SuperAdmin: 0,
  Admin: 1,
  Normal: 2,
})

export const EstadoEmpresa = Object.freeze({
  Inactivo: 0,
  MesGratis: 1,
  PlanActivo: 2,
})

export const EstadoFactura = Object.freeze({
  Cancelado: 0,
  Activo: 1,
  Saldado: 2,
  CuentaAbierta: 3,
})

export const EstadoCompra = Object.freeze({
  Activo: 1,
  Saldado: 2,
  Cancelado: 3,
})

export const TipoCompra = Object.freeze({
  Contado: 0,
  Credito: 1,
})

export const EstadoConduce = Object.freeze({
  NoEntrega: 0,
  Entrega: 1,
  Entregado: 2,
})

export const AccionPermiso = Object.freeze({
  Otorgar: 0,
  Revocar: 1,
})

/**
 * Convención confirmada para el campo numérico `metodoPago`.
 * La API lo guarda como `int?`, sin enum propio.
 */
export const MetodoPago = Object.freeze({
  Efectivo: 1,
  Cheque: 2,
  Tarjeta: 3,
  Transferencia: 4,
})

export const METODO_PAGO_LABEL = Object.freeze({
  1: 'Efectivo',
  2: 'Cheque',
  3: 'Tarjeta',
  4: 'Transferencia',
})

export const ESTADO_FACTURA_LABEL = Object.freeze({
  0: 'Cancelada',
  1: 'Activa',
  2: 'Saldada',
  3: 'Cuenta abierta',
})

export const ESTADO_COMPRA_LABEL = Object.freeze({
  1: 'Activa',
  2: 'Saldada',
  3: 'Cancelada',
})

export const ESTADO_CONDUCE_LABEL = Object.freeze({
  0: 'No entrega',
  1: 'Entrega',
  2: 'Entregado',
})

export const ESTADO_EMPRESA_LABEL = Object.freeze({
  0: 'Inactiva',
  1: 'Mes gratis',
  2: 'Plan activo',
})

export const TIPO_USUARIO_LABEL = Object.freeze({
  0: 'SuperAdmin',
  1: 'Administrador',
  2: 'Normal',
})
