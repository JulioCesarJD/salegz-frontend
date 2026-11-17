/**
 * @typedef {Object} MenuSemanalDetalle
 * @property {number} menuSemanalDetalleId
 * @property {number|null} menuSemanalId
 * @property {number} recetaId
 * @property {string|null} recetaNombre
 * @property {number} porciones
 * @property {number|null} orden
 * @property {string|null} observaciones
 *
 * @typedef {Object} MenuSemanal
 * @property {number} menuSemanalId
 * @property {number|null} empresaId
 * @property {string|null} servicio
 * @property {number} semana
 * @property {number} diaSemana
 * @property {string|null} fecha
 * @property {boolean} estado
 * @property {string|null} fechaRegistro
 * @property {MenuSemanalDetalle[]} detalles
 */

/**
 * Convención de `DiaSemana` en la API: entero sin validar.
 * Se centraliza aquí para poder cambiarla en un solo lugar.
 * 1 = Lunes … 7 = Domingo.
 */
export const DIAS_SEMANA = Object.freeze([
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
])

export const diaSemanaLabel = (dia) =>
  DIAS_SEMANA.find((d) => d.value === Number(dia))?.label ?? '—'

/**
 * @typedef {Object} MenuSemanalDetalleRequest
 * @property {number} recetaId
 * @property {number} porciones
 * @property {number|null} [orden]
 * @property {string|null} [observaciones]
 *
 * @typedef {Object} MenuSemanalCreateRequest
 * @property {string|null} [servicio]
 * @property {number} semana
 * @property {number} diaSemana
 * @property {string|null} [fecha]
 * @property {boolean} [estado]
 * @property {MenuSemanalDetalleRequest[]} [detalles]
 */

export const MENU_SEMANAL_ENDPOINTS = Object.freeze({
  base: '/api/menu-semanal',
  detalles: '/api/menu-semanal-detalles',
})
