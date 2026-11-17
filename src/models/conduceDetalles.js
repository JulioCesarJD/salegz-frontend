/**
 * Alias de detalle de conduce. El `conduceId` del padre no viaja en el body:
 * se usa `POST /api/conduces/{conduceId}/detalles`.
 * El `subTotal` lo calcula el servidor como `porciones * precioUnitario`.
 * @typedef {Object} ConduceDetalleItem
 * @property {number} conduceDetalleId
 * @property {number|null} conduceId
 * @property {number} recetaId
 * @property {string|null} recetaNombre
 * @property {number} porciones
 * @property {number} precioUnitario
 * @property {number} costoUnitario
 * @property {number} subTotal
 * @property {number|null} recetaDescuentoId
 * @property {string|null} observaciones
 */

export const CONDUCE_DETALLE_ENDPOINTS = Object.freeze({
  base: '/api/conduce-detalles',
  /** create: `${baseConduces}/${conduceId}/detalles` */
  porConduce: (conduceId) => `/api/conduces/${conduceId}/detalles`,
})
