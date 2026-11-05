/**
 * @typedef {Object} CompraDetalle
 * @property {number} compraDetalleId
 * @property {number} productoId
 * @property {string|null} productoDescripcion
 * @property {number} cantidad
 * @property {number} subTotal
 * @property {number} descuento
 */

/**
 * Tipo: 0 = Contado, 1 = Crédito.
 * Estado: 1 = Activo, 2 = Saldado, 3 = Cancelado.
 * La API calcula `saldoPendiente` como el total (no hay pagos parciales).
 * @typedef {Object} Compra
 * @property {number} compraId
 * @property {number|null} clienteId
 * @property {number} total
 * @property {number} itbis
 * @property {string|null} fecha
 * @property {number} tipo
 * @property {number} estado
 * @property {string|null} comprobante
 * @property {CompraDetalle[]} detalles
 * @property {number} saldoPendiente
 */

/**
 * @typedef {Object} CompraCreateRequest
 * @property {number|null} [clienteId]
 * @property {number} tipo
 * @property {{productoId:number,cantidad:number,descuento:number}[]} detalles
 */

export const COMPRA_ENDPOINTS = Object.freeze({
  base: '/api/compras',
  cancelar: (id) => `/api/compras/${id}/cancelar`,
})
