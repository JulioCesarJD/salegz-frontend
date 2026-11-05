/**
 * @typedef {Object} UsuarioCreateRequest
 * @property {string} nombre
 * @property {string} correo
 * @property {string} contrasena
 * @property {number} tipoUsuario
 * @property {number|null} [empresaId]
 * @property {number|null} [pin]
 * @property {boolean} [activo]
 */

/**
 * @typedef {Object} UsuarioUpdateRequest
 * @property {string} nombre
 * @property {string} correo
 * @property {number|null} [tipoUsuario]
 * @property {number|null} [empresaId]
 * @property {number|null} [pin]
 * @property {boolean|null} [activo]
 */

/**
 * @typedef {Object} UsuarioListFilter
 * @property {string} [search]
 * @property {number} [empresaId]
 * @property {number} [tipoUsuario]
 * @property {boolean} [activo]
 * @property {number} [page]
 * @property {number} [pageSize]
 */

export const USUARIO_ENDPOINTS = Object.freeze({
  base: '/api/usuarios',
})
