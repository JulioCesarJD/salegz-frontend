/**
 * @typedef {Object} NotaCreditoDetalle
 * @property {number} notaCreditoDetalleId
 * @property {number} productoId
 * @property {string|null} productoDescripcion
 * @property {number} cantidad
 * @property {number} subTotal
 * @property {number} itbis
 *
 * @typedef {Object} NotaCredito
 * @property {number} notaCreditoId
 * @property {number} facturaId
 * @property {number} total
 * @property {number} itbis
 * @property {string|null} fecha
 * @property {string|null} razonModificacion
 * @property {string|null} comprobante
 * @property {string|null} estadoComprobante
 * @property {string|null} urlDgii
 * @property {string|null} logDgii
 * @property {number} conteo
 * @property {string|null} fechaVencimiento
 * @property {NotaCreditoDetalle[]} detalles
 *
 * El servidor calcula Total/ITBIS y reduce la factura original en una
 * transacción; la API no expone cancelación de notas de crédito.
 * @typedef {Object} NotaCreditoCreateRequest
 * @property {number} facturaId
 * @property {string} razonModificacion
 * @property {{productoId:number,cantidad:number}[]} detalles
 */

export const NOTA_CREDITO_ENDPOINTS = Object.freeze({
  base: '/api/notas-credito',
})
