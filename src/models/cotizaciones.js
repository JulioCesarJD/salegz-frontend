/**
 * @typedef {Object} CotizacionDetalle
 * @property {number} cotizacionDetalleId
 * @property {number} productoId
 * @property {string|null} productoDescripcion
 * @property {number} cantidad
 * @property {number} subTotal
 * @property {number} itbis
 *
 * @typedef {Object} Cotizacion
 * @property {number} cotizacionId
 * @property {number|null} clienteId
 * @property {number} total
 * @property {number} itbis
 * @property {string|null} fecha
 * @property {string|null} fechaVencimiento
 * @property {number|null} tipoFactura
 * @property {string|null} asunto
 * @property {number} exentoTotal
 * @property {number} gravadoTotal
 * @property {CotizacionDetalle[]} detalles
 *
 * El servidor calcula Total/ITBIS; Facturar crea la factura vía POST /facturar.
 * @typedef {Object} CotizacionCreateRequest
 * @property {number|null} [clienteId]
 * @property {number|null} [tipoFactura]
 * @property {string|null} [asunto]
 * @property {string|null} [fechaVencimiento]
 * @property {{productoId:number,cantidad:number}[]} detalles
 */

export const COTIZACION_ENDPOINTS = Object.freeze({
  base: '/api/cotizaciones',
})
