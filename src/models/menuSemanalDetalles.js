/**
 * Alias de detalle de menú semanal. El `menuSemanalId` del padre no viaja en
 * el body: se usa `POST /api/menu-semanal/{menuSemanalId}/detalles`.
 * @typedef {Object} MenuSemanalDetalleItem
 * @property {number} menuSemanalDetalleId
 * @property {number|null} menuSemanalId
 * @property {number} recetaId
 * @property {string|null} recetaNombre
 * @property {number} porciones
 * @property {number|null} orden
 * @property {string|null} observaciones
 */

export const MENU_SEMANAL_DETALLE_ENDPOINTS = Object.freeze({
  base: '/api/menu-semanal-detalles',
  /** create: `${baseMenus}/${menuSemanalId}/detalles` */
  porMenu: (menuSemanalId) => `/api/menu-semanal/${menuSemanalId}/detalles`,
})
