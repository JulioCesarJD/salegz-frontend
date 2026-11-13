import api from '../lib/api'
import { cleanParams, unwrapPaged } from './_helpers'

const BASE = '/api/cotizaciones'

/** GET /api/cotizaciones?search=&fechaDesde=&fechaHasta=&page=&pageSize= */
export const getCotizaciones = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return unwrapPaged(data)
}

export const getCotizacionesPaged = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return data
}

/** GET /api/cotizaciones/{id} — endpoint real de la API. */
export const getCotizacionById = async (cotizacionId) => {
  const { data } = await api.get(`${BASE}/${cotizacionId}`)
  return data
}

/**
 * POST /api/cotizaciones
 * El servidor calcula Total/ITBIS desde precio y flags Exento del producto.
 */
export const createCotizacion = async (data) => {
  const { data: result } = await api.post(BASE, {
    clienteId: data.clienteId ?? null,
    tipoFactura: data.tipoFactura ?? null,
    asunto: data.asunto ?? null,
    fechaVencimiento: data.fechaVencimiento ?? null,
    detalles: (data.detalles ?? []).map((d) => ({
      productoId: d.productoId,
      cantidad: parseFloat(d.cantidad) || 0,
    })),
  })
  return result
}

/** PUT /api/cotizaciones/{id} */
export const updateCotizacion = async (cotizacionId, data) => {
  const { data: result } = await api.put(`${BASE}/${cotizacionId}`, {
    clienteId: data.clienteId ?? null,
    tipoFactura: data.tipoFactura ?? null,
    asunto: data.asunto ?? null,
    fechaVencimiento: data.fechaVencimiento ?? null,
    detalles: (data.detalles ?? []).map((d) => ({
      productoId: d.productoId,
      cantidad: parseFloat(d.cantidad) || 0,
    })),
  })
  return result
}

export const deleteCotizacion = async (cotizacionId) => {
  await api.delete(`${BASE}/${cotizacionId}`)
}

/** POST /api/cotizaciones/{id}/facturar — crea la factura desde la cotización. */
export const facturarCotizacion = async (cotizacionId) => {
  const { data } = await api.post(`${BASE}/${cotizacionId}/facturar`)
  return data
}

export { BASE as COTIZACION_ENDPOINTS_BASE }
