/**
 * Postre no tiene EmpresaId en la API: el alcance por empresa se resuelve
 * vía Conduce -> Escuela en el servidor.
 * @typedef {Object} Postre
 * @property {number} postreId
 * @property {string} nombre
 */

export const POSTRE_ENDPOINTS = Object.freeze({
  base: '/api/postres',
})
