/**
 * @typedef {Object} Usuario
 * @property {number} usuarioId
 * @property {string} nombre
 * @property {string} correo
 * @property {number} tipoUsuario
 * @property {string} tipoUsuarioNombre
 * @property {number|null} empresaId
 * @property {string|null} empresaNombre
 * @property {string[]} permisos Códigos "Modulo.Accion".
 * @property {boolean} activo
 */

/**
 * @typedef {Object} LoginRequest
 * @property {string} correo
 * @property {string} contrasena
 */

/**
 * @typedef {Object} LoginResponse
 * @property {string} accessToken
 * @property {string} refreshToken
 * @property {string} expiracion Fecha ISO.
 * @property {Usuario} usuario
 */

/**
 * @typedef {Object} ChangePasswordRequest
 * @property {string} contrasenaActual
 * @property {string} nuevaContrasena
 */

/**
 * @typedef {Object} ChangePinRequest
 * @property {string} contrasenaActual
 * @property {number} nuevoPin
 */

export const AUTH_ENDPOINTS = Object.freeze({
  login: '/api/auth/login',
  refresh: '/api/auth/refresh',
  logout: '/api/auth/logout',
  me: '/api/auth/me',
  changePassword: '/api/auth/change-password',
  changePin: '/api/auth/change-pin',
})
