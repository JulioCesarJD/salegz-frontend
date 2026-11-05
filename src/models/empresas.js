/**
 * Estado: 0 = Inactiva, 1 = Mes gratis, 2 = Plan activo.
 * @typedef {Object} Empresa
 * @property {number} empresaId
 * @property {string} nombre
 * @property {string|null} correo
 * @property {string|null} rnc
 * @property {string|null} direccion
 * @property {string|null} telefono
 * @property {number|null} cantUsuario
 * @property {number|null} montoPlan
 * @property {number} estado
 * @property {'Inactivo'|'MesGratis'|'PlanActivo'} estadoNombre
 * @property {string|null} fechaExpiracion
 * @property {number} totalUsuarios
 */

/**
 * @typedef {Object} EmpresaCreateRequest
 * @property {string} nombre
 * @property {string|null} [correo]
 * @property {string|null} [rnc]
 * @property {string|null} [direccion]
 * @property {string|null} [telefono]
 * @property {number|null} [cantUsuario]
 * @property {number|null} [montoPlan]
 * @property {number} [estado]
 * @property {string|null} [fechaExpiracion]
 */

/**
 * `PUT /api/controles/{empresaId}` existe pero actualmente es un stub que solo responde ok.
 * @typedef {Object} ControlesEmpresa
 */

export const EMPRESA_ENDPOINTS = Object.freeze({
  base: '/api/empresas',
  controles: (empresaId) => `/api/controles/${empresaId}`,
})
