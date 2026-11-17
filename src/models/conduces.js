/**
 * Conduce no tiene EmpresaId en el request: el tenant se resuelve en el
 * servidor vía Escuela. El `monto` lo calcula la API como la suma de los
 * subtotales de los detalles; el frontend no lo envía.
 *
 * @typedef {Object} ConduceDetalle
 * @property {number} conduceDetalleId
 * @property {number|null} conduceId
 * @property {number} recetaId
 * @property {string|null} recetaNombre
 * @property {number} porciones
 * @property {number} precioUnitario
 * @property {number} costoUnitario
 * @property {number} subTotal
 * @property {number|null} recetaDescuentoId
 * @property {string|null} recetaDescuentoNombre
 * @property {string|null} observaciones
 *
 * @typedef {Object} Conduce
 * @property {number} conduceId
 * @property {number|null} empresaId
 * @property {number|null} numeroConduce
 * @property {number|null} usuarioId
 * @property {string|null} usuarioNombre
 * @property {number|null} escuelaId
 * @property {string|null} escuelaNombre
 * @property {number|null} menuComidaId
 * @property {string|null} menuComidaNombre
 * @property {number|null} postreId
 * @property {string|null} postreNombre
 * @property {string|null} servicio
 * @property {number} porciones
 * @property {number} monto
 * @property {string|null} fecha
 * @property {string|null} fechaRegistro
 * @property {string|null} observaciones
 * @property {string|null} edicionReceta
 * @property {string|null} edicionPostre
 * @property {0|1|2} estado
 * @property {'NoEntrega'|'Entrega'|'Entregado'} estadoNombre
 * @property {ConduceDetalle[]} detalles
 */

/**
 * EstadoConduce de la API. Se serializa como número.
 * 0 = No entrega, 1 = Entrega, 2 = Entregado.
 */
export const ESTADOS_CONDUCE = Object.freeze({
  0: { label: 'No entrega', badge: 'badge badge-gray' },
  1: { label: 'Entrega', badge: 'badge badge-yellow' },
  2: { label: 'Entregado', badge: 'badge badge-green' },
})

export const estadoConduceLabel = (estado) =>
  ESTADOS_CONDUCE[estado]?.label ?? '—'

export const estadoConduceBadge = (estado) =>
  ESTADOS_CONDUCE[estado]?.badge ?? 'badge badge-gray'

/**
 * @typedef {Object} ConduceDetalleRequest
 * @property {number} recetaId
 * @property {number} porciones
 * @property {number} precioUnitario
 * @property {number} costoUnitario
 * @property {string|null} [observaciones]
 *
 * @typedef {Object} ConduceCreateRequest
 * @property {number|null} [numeroConduce]
 * @property {number|null} [usuarioId]
 * @property {number} escuelaId
 * @property {number|null} [menuComidaId]
 * @property {number|null} [postreId]
 * @property {string|null} [servicio]
 * @property {number} [porciones]
 * @property {string|null} [fecha]
 * @property {string|null} [observaciones]
 * @property {string|null} [edicionReceta]
 * @property {string|null} [edicionPostre]
 * @property {0|1|2} [estado]
 * @property {ConduceDetalleRequest[]} [detalles]
 *
 * @typedef {Object} ConduceGenerarRequest
 * @property {string} fecha
 * @property {number[]} [escuelasSinClase]
 * @property {number|null} [menuComidaId]
 * @property {number|null} [postreId]
 * @property {string|null} [servicio]
 * @property {number} [porciones]
 */

export const CONDUCE_ENDPOINTS = Object.freeze({
  base: '/api/conduces',
  generarJornada: '/api/conduces/generar-jornada',
  detalles: '/api/conduce-detalles',
})
