/**
 * @typedef {Object} MenuComida
 * @property {number} menuComidaId
 * @property {string} nombre
 * @property {number} precio
 * @property {number} costo
 *
 * La API asigna EmpresaId desde el token; no se envía en el payload.
 * @typedef {Object} MenuComidaCreateRequest
 * @property {string} nombre
 * @property {number} precio
 * @property {number} costo
 */

export const MENU_COMIDA_ENDPOINTS = Object.freeze({
  base: '/api/menu-comida',
})
