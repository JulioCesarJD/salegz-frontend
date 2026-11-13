/**
 * Estado: 0 = No entrega, 1 = Entrega, 2 = Entregado.
 * Conduce no tiene EmpresaId: el tenant se resuelve vía Escuela.EmpresaId.
 * @typedef {Object} Conduce
 * @property {number} conduceId
 * @property {number|null} numeroConduce
 * @property {number|null} escuelaId
 * @property {string|null} escuelaNombre
 * @property {number|null} menuComidaId
 * @property {string|null} menuComidaNombre
 * @property {number|null} postreId
 * @property {string|null} postreNombre
 * @property {string|null} fecha
 * @property {string|null} observaciones
 * @property {string|null} edicionReceta
 * @property {string|null} edicionPostre
 * @property {number} estado
 * @property {'NoEntrega'|'Entrega'|'Entregado'} estadoNombre
 */

/**
 * @typedef {Object} ConduceGenerarRequest
 * @property {string} fecha
 * @property {number[]} escuelasSinClase
 */

export const CONDUCE_ENDPOINTS = Object.freeze({
  base: '/api/conduces',
  generarJornada: '/api/conduces/generar-jornada',
})
