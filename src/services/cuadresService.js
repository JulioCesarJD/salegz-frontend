import api from '../lib/api'
import { cleanParams, unwrapPaged } from './_helpers'
import { CUADRE_ENDPOINTS } from '../models/cuadres'
import * as reportesService from './reportesService'

/**
 * GET /api/cuadres?page=&pageSize=
 * La API no filtra por fechas; si se reciben `desde`/`hasta` se filtran
 * localmente sobre la página solicitada.
 */
export const getCuadres = async ({ desde, hasta, ...params } = {}) => {
  const { data } = await api.get(CUADRE_ENDPOINTS.base, {
    params: cleanParams({ pageSize: 100, ...params }),
  })
  const items = unwrapPaged(data)

  if (!desde && !hasta) return items

  return items.filter((cuadre) => {
    if (!cuadre.fecha) return false
    const fecha = String(cuadre.fecha).slice(0, 10)
    if (desde && fecha < String(desde).slice(0, 10)) return false
    if (hasta && fecha > String(hasta).slice(0, 10)) return false
    return true
  })
}

export const getCuadresPaged = async (params = {}) => {
  const { data } = await api.get(CUADRE_ENDPOINTS.base, {
    params: cleanParams(params),
  })
  return data
}

export const getCuadreById = async (cuadreId) => {
  const { data } = await api.get(`${CUADRE_ENDPOINTS.base}/${cuadreId}`)
  return data
}

/** POST /api/cuadres */
export const createCuadre = async (data) => {
  const { data: created } = await api.post(CUADRE_ENDPOINTS.base, {
    usuarioId: data?.usuarioId ?? null,
    fecha: data?.fecha ?? null,
  })
  return created
}

/** Reporte real usado por el modal de cuadre para ver las ventas del día. */
export const getVentasCuadre = (desde, hasta) =>
  reportesService.getVentasRango(desde, hasta)

export { CUADRE_ENDPOINTS }
