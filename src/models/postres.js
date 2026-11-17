/**
 * La API filtra los postres por la empresa del token.
 * @typedef {Object} Postre
 * @property {number} postreId
 * @property {number|null} empresaId
 * @property {string} nombre
 * @property {number} costo
 * @property {boolean} estado
 * @property {string|null} fechaRegistro
 *
 * @typedef {Object} PostreCreateRequest
 * @property {string} nombre
 * @property {number} [costo]
 * @property {boolean} [estado]
 */

export const POSTRE_ENDPOINTS = Object.freeze({
  base: '/api/postres',
})
