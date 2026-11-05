/**
 * La API calcula los totales al crear el cuadre desde las facturas y abonos
 * del día. No existe campo de estado, fondo inicial ni conteo por denominación.
 * @typedef {Object} Cuadre
 * @property {number} cuadreId
 * @property {number|null} usuarioId
 * @property {string|null} usuarioNombre
 * @property {string|null} fecha
 * @property {number} total
 * @property {number} totalEfectivo
 * @property {number} totalCheque
 * @property {number} totalTarjeta
 * @property {number} totalTransaccion
 * @property {number} cantidadCheque
 * @property {number} cantidadTarjeta
 * @property {number} cantidadTransaccion
 * @property {number} ventasSistema
 * @property {number} cantidadCancelado
 * @property {number} montoCancelado
 * @property {number} cantidadNotaCredito
 * @property {number} montoNotaCredito
 */

/**
 * @typedef {Object} CuadreCreateRequest
 * @property {number|null} [usuarioId]
 * @property {string|null} [fecha]
 */

export const CUADRE_ENDPOINTS = Object.freeze({
  base: '/api/cuadres',
})
