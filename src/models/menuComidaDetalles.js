/**
 * Alias de detalle de menú. El `menuComidaId` del padre no viaja en el body:
 * se usa `POST /api/menu-comida/{menuComidaId}/detalles`.
 * @typedef {Object} MenuComidaDetalleItem
 * @property {number} menuComidaDetalleId
 * @property {number|null} menuComidaId
 * @property {number} productoId
 * @property {string|null} productoDescripcion
 * @property {number} cantidad
 * @property {string|null} unidadMedida
 * @property {number} costoUnitario
 * @property {string|null} observacion
 * @property {number} costoTotal
 */

export const MENU_COMIDA_DETALLE_ENDPOINTS = Object.freeze({
  base: '/api/menu-comida-detalles',
  /** create: `${baseMenus}/${menuComidaId}/detalles` */
  porMenu: (menuComidaId) => `/api/menu-comida/${menuComidaId}/detalles`,
})
