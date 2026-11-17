/**
 * La API asigna EmpresaId desde el token; no se envía en el payload.
 * El listado llega ordenado por `orden` y luego por nombre.
 * @typedef {Object} Escuela
 * @property {number} escuelaId
 * @property {number|null} empresaId
 * @property {string|null} codigo
 * @property {string|null} institucion
 * @property {string} nombre
 * @property {string|null} encargado
 * @property {string|null} director
 * @property {string|null} direccion
 * @property {string|null} telefono
 * @property {string|null} rnc
 * @property {string|null} provincia
 * @property {string|null} municipio
 * @property {string|null} distrito
 * @property {number|null} cantidadEstudiante
 * @property {number|null} orden
 * @property {boolean} estado
 * @property {string|null} fechaRegistro
 *
 * @typedef {Object} EscuelaCreateRequest
 * @property {string|null} [codigo]
 * @property {string|null} [institucion]
 * @property {string} nombre
 * @property {string|null} [encargado]
 * @property {string|null} [director]
 * @property {string|null} [direccion]
 * @property {string|null} [telefono]
 * @property {string|null} [rnc]
 * @property {string|null} [provincia]
 * @property {string|null} [municipio]
 * @property {string|null} [distrito]
 * @property {number|null} [cantidadEstudiante]
 * @property {number|null} [orden]
 * @property {boolean} [estado]
 */

export const ESCUELA_ENDPOINTS = Object.freeze({
  base: '/api/escuelas',
})
