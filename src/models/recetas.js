/**
 * @typedef {Object} RecetaIngrediente
 * @property {number} recetaIngredienteId
 * @property {number|null} recetaId
 * @property {number} productoId
 * @property {string|null} productoDescripcion
 * @property {number} cantidad
 * @property {string|null} unidadMedida
 *
 * @typedef {Object} Receta
 * @property {number} recetaId
 * @property {number|null} empresaId
 * @property {string|null} codigo
 * @property {string} nombre
 * @property {string|null} descripcion
 * @property {number} porcionesBase
 * @property {number} precioVenta
 * @property {number} costo
 * @property {boolean} estado
 * @property {RecetaIngrediente[]} ingredientes
 *
 * @typedef {Object} RecetaIngredienteRequest
 * @property {number} productoId
 * @property {number} cantidad
 * @property {string|null} [unidadMedida]
 *
 * @typedef {Object} RecetaCreateRequest
 * @property {string|null} [codigo]
 * @property {string} nombre
 * @property {string|null} [descripcion]
 * @property {number} [porcionesBase]
 * @property {number} [precioVenta]
 * @property {number} [costo]
 * @property {boolean} [estado]
 * @property {RecetaIngredienteRequest[]} [ingredientes]
 */

export const RECETA_ENDPOINTS = Object.freeze({
  base: '/api/recetas',
  ingredientes: '/api/receta-ingredientes',
})
