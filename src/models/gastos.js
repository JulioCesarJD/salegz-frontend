/**
 * No hay catálogo de conceptos de gasto; la descripción va en el gasto.
 * @typedef {Object} GastoDetalle
 * @property {number} gastosDetalleId
 * @property {number|null} usuarioId
 * @property {number} subTotal
 * @property {number} itbis
 * @property {string|null} fecha
 * @property {string|null} comprobante
 */

/**
 * @typedef {Object} Gasto
 * @property {number} gastosId
 * @property {string|null} fechaCreacion
 * @property {string|null} descripcion
 * @property {GastoDetalle[]} detalles
 */

/**
 * PUT /api/gastos/{id} reemplaza los detalles por los enviados.
 * @typedef {Object} GastoCreateRequest
 * @property {string} descripcion
 * @property {{usuarioId:number|null,subTotal:number,itbis:number,comprobante:string|null}[]} detalles
 */

export const GASTO_ENDPOINTS = Object.freeze({
  base: '/api/gastos',
})
