/**
 * La API asigna EmpresaId desde el token; no se envía en el payload.
 * `detalles` se envía completo en el create/update: el servidor reemplaza
 * los detalles existentes cuando el arreglo viene informado.
 *
 * @typedef {Object} MenuComidaDetalle
 * @property {number} menuComidaDetalleId
 * @property {number|null} menuComidaId
 * @property {number} productoId
 * @property {string|null} productoDescripcion
 * @property {number} cantidad
 * @property {string|null} unidadMedida
 * @property {number} costoUnitario
 * @property {string|null} observacion
 * @property {number} costoTotal
 *
 * @typedef {Object} MenuComida
 * @property {number} menuComidaId
 * @property {number|null} empresaId
 * @property {string} nombre
 * @property {number} precio
 * @property {number} costo
 * @property {boolean} estado
 * @property {MenuComidaDetalle[]} detalles
 *
 * @typedef {Object} MenuComidaDetalleRequest
 * @property {number} productoId
 * @property {number} cantidad
 * @property {string|null} [unidadMedida]
 * @property {number} costoUnitario
 * @property {string|null} [observacion]
 *
 * @typedef {Object} MenuComidaCreateRequest
 * @property {string} nombre
 * @property {number} precio
 * @property {number} costo
 * @property {boolean} [estado]
 * @property {MenuComidaDetalleRequest[]} [detalles]
 */

export const MENU_COMIDA_ENDPOINTS = Object.freeze({
  base: '/api/menu-comida',
  detalles: '/api/menu-comida-detalles',
})
