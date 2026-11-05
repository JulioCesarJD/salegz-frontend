/**
 * @typedef {Object} ReporteVenta
 * @property {string} fecha
 * @property {number} total
 * @property {number} itbis
 * @property {number} cantidad
 */

/**
 * @typedef {Object} ReporteProductoVendido
 * @property {number} productoId
 * @property {string|null} descripcion
 * @property {number} cantidadVendida
 * @property {number} total
 */

/**
 * @typedef {Object} ReporteInventarioBajo
 * @property {number} productoId
 * @property {string|null} descripcion
 * @property {number} cantidad
 * @property {number} minimo
 */

/**
 * @typedef {Object} ReporteCxC
 * @property {number} clienteId
 * @property {string|null} nombre
 * @property {number} saldoPendiente
 */

/**
 * @typedef {Object} ReporteGasto
 * @property {string} fecha
 * @property {number} total
 */

export const REPORTE_ENDPOINTS = Object.freeze({
  ventasRango: '/api/reportes/ventas-rango',
  productosMasVendidos: '/api/reportes/productos-mas-vendidos',
  inventarioBajoMinimo: '/api/reportes/inventario-bajo-minimo',
  cxcPendientes: '/api/reportes/cx-c-pendientes',
  gastosPeriodo: '/api/reportes/gastos-periodo',
})
