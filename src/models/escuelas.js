/**
 * @typedef {Object} Escuela
 * @property {number} escuelaId
 * @property {string} nombre
 * @property {string|null} encargado
 * @property {string|null} direccion
 * @property {string|null} telefono
 * @property {string|null} provincia
 * @property {string|null} municipio
 * @property {string|null} distrito
 * @property {number|null} cantidadEstudiante
 * @property {number|null} orden
 *
 * La API asigna EmpresaId desde el token; no se envía en el payload.
 * @typedef {Object} EscuelaCreateRequest
 * @property {string} nombre
 * @property {string|null} [encargado]
 * ...
 */

export const ESCUELA_ENDPOINTS = Object.freeze({
  base: '/api/escuelas',
})
