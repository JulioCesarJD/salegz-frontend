/**
 * @typedef {Object} FacturaDetalle
 * @property {number} facturaDetalleId
 * @property {number} productoId
 * @property {string|null} productoDescripcion
 * @property {number} cantidad
 * @property {number} subTotal
 * @property {number} itbis
 * @property {number} costo
 * @property {number} descuento
 * @property {number} comision
 */

/**
 * `tipo`: false = Contado, true = Crédito.
 * `saldoPendiente` lo calcula la API (total - montoPagado).
 * @typedef {Object} Factura
 * @property {number} facturaId
 * @property {number|null} clienteId
 * @property {string|null} nombreCliente
 * @property {number} estado
 * @property {'Cancelado'|'Activo'|'Saldado'|'CuentaAbierta'} estadoNombre
 * @property {boolean} tipo
 * @property {'Contado'|'Crédito'} tipoNombre
 * @property {number|null} metodoPago
 * @property {number} total
 * @property {number} itbis
 * @property {number} montoPagado
 * @property {number} exento
 * @property {number} gravado
 * @property {string|null} fecha
 * @property {string|null} fechaVencimiento
 * @property {string|null} comprobante
 * @property {string|null} estadoComprobante
 * @property {FacturaDetalle[]} detalles
 * @property {number} saldoPendiente
 */

/**
 * @typedef {Object} FacturaDetalleRequest
 * @property {number} productoId
 * @property {number} cantidad
 * @property {number} descuento
 */

/**
 * @typedef {Object} FacturaCreateRequest
 * @property {number|null} [clienteId]
 * @property {boolean} tipo
 * @property {number|null} [metodoPago]
 * @property {string|null} [fechaVencimiento]
 * @property {FacturaDetalleRequest[]} detalles
 */

/**
 * @typedef {Object} FacturaAbonoRequest
 * @property {number} monto
 * @property {number|null} [metodoPago]
 * @property {string|null} [descripcionPago]
 */

/**
 * @typedef {Object} FacturaListFilter
 * @property {string} [search]
 * @property {number} [estado]
 * @property {boolean} [tipo]
 * @property {string} [fechaDesde]
 * @property {string} [fechaHasta]
 * @property {number} [page]
 * @property {number} [pageSize]
 */

export const FACTURA_ENDPOINTS = Object.freeze({
  base: '/api/facturas',
  saldoCliente: (clienteId) => `/api/facturas/cliente/${clienteId}/saldo`,
  cancelar: (id) => `/api/facturas/${id}/cancelar`,
  abonar: (id) => `/api/facturas/${id}/abonar`,
})
