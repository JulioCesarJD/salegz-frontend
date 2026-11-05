/**
 * Estado: 0 = No entrega, 1 = Entrega, 2 = Entregado.
 * @typedef {Object} Conduce
 * @property {number} conduceId
 * @property {number|null} numeroConduce
 * @property {number|null} escuelaId
 * @property {string|null} escuelaNombre
 * @property {number} estado
 * @property {'NoEntrega'|'Entrega'|'Entregado'} estadoNombre
 * @property {string|null} fecha
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
