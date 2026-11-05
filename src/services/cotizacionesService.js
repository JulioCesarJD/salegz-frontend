import api from '../lib/api'
import { notSupported, unwrapPaged } from './_helpers'

const BASE = '/api/cotizaciones'

/** GET /api/cotizaciones — hoy devuelve una lista vacía. */
export const getCotizaciones = async () => {
  const { data } = await api.get(BASE)
  return unwrapPaged(data)
}

/**
 * La API no expone GET /api/cotizaciones/{id}.
 * Se resuelve sobre el listado para no inventar un endpoint.
 */
export const getCotizacionById = async (cotizacionId) => {
  const items = await getCotizaciones()
  return items.find((c) => c.cotizacionId === Number(cotizacionId)) ?? null
}

/** POST /api/cotizaciones — hoy responde `{ message: "ok" }`. */
export const createCotizacion = async (data) => {
  const { data: result } = await api.post(BASE, data)
  return result
}

/** POST /api/cotizaciones/{id}/facturar */
export const facturarCotizacion = async (cotizacionId) => {
  const { data } = await api.post(`${BASE}/${cotizacionId}/facturar`)
  return data
}

/** La API no expone edición de cotizaciones. */
export const updateCotizacion = () => notSupported('Editar una cotización')

export { BASE as COTIZACION_ENDPOINTS_BASE }
