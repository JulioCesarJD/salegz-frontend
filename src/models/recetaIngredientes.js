/**
 * Alias de detalle de receta. El `recetaId` del padre no viaja en el body:
 * se usa `POST /api/recetas/{recetaId}/ingredientes`.
 * @typedef {Object} RecetaIngredienteDetalle
 * @property {number} recetaIngredienteId
 * @property {number|null} recetaId
 * @property {number} productoId
 * @property {string|null} productoDescripcion
 * @property {number} cantidad
 * @property {string|null} unidadMedida
 */

export const RECETA_INGREDIENTE_ENDPOINTS = Object.freeze({
  base: '/api/receta-ingredientes',
  /** create: `${baseRecetas}/${recetaId}/ingredientes` */
  porReceta: (recetaId) => `/api/recetas/${recetaId}/ingredientes`,
})
