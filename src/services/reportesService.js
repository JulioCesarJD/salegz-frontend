import api from '../lib/api'
import { cleanParams } from './_helpers'
import { REPORTE_ENDPOINTS } from '../models/reportes'

/** GET /api/reportes/ventas-rango?desde=&hasta= */
export const getVentasRango = async (desde, hasta) => {
  const { data } = await api.get(REPORTE_ENDPOINTS.ventasRango, {
    params: cleanParams({ desde, hasta }),
  })
  return data ?? []
}

/** GET /api/reportes/productos-mas-vendidos?desde=&hasta= */
export const getProductosMasVendidos = async (desde, hasta) => {
  const { data } = await api.get(REPORTE_ENDPOINTS.productosMasVendidos, {
    params: cleanParams({ desde, hasta }),
  })
  return data ?? []
}

/** GET /api/reportes/inventario-bajo-minimo */
export const getInventarioBajoMinimo = async () => {
  const { data } = await api.get(REPORTE_ENDPOINTS.inventarioBajoMinimo)
  return data ?? []
}

/** GET /api/reportes/cx-c-pendientes */
export const getCxCPendientes = async () => {
  const { data } = await api.get(REPORTE_ENDPOINTS.cxcPendientes)
  return data ?? []
}

/** GET /api/reportes/gastos-periodo?desde=&hasta= */
export const getGastosPeriodo = async (desde, hasta) => {
  const { data } = await api.get(REPORTE_ENDPOINTS.gastosPeriodo, {
    params: cleanParams({ desde, hasta }),
  })
  return data ?? []
}

export { REPORTE_ENDPOINTS }
