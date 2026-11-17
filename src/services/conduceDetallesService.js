import api from '../lib/api'
import { cleanParams, unwrapPaged } from './_helpers'
import { CONDUCE_DETALLE_ENDPOINTS } from '../models/conduceDetalles'

const BASE = CONDUCE_DETALLE_ENDPOINTS.base

/** GET /api/conduce-detalles?conduceId=&recetaId=&page=&pageSize= */
export const getConduceDetalles = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return unwrapPaged(data)
}

export const getConduceDetallesPaged = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return data
}

export const getConduceDetalleById = async (id) => {
  const { data } = await api.get(`${BASE}/${id}`)
  return data
}

const toPayload = (data) => ({
  recetaId: Number(data.recetaId),
  porciones: Number(data.porciones) || 0,
  precioUnitario: Number(data.precioUnitario) || 0,
  costoUnitario: Number(data.costoUnitario) || 0,
  recetaDescuentoId: data.recetaDescuentoId ?? null,
  observaciones: data.observaciones || null,
})

/**
 * POST /api/conduces/{conduceId}/detalles
 * El id del padre va en la ruta, no en el body.
 */
export const createConduceDetalle = async (conduceId, data) => {
  const { data: result } = await api.post(
    CONDUCE_DETALLE_ENDPOINTS.porConduce(conduceId),
    toPayload(data)
  )
  return result
}

/** PUT /api/conduce-detalles/{id} */
export const updateConduceDetalle = async (id, data) => {
  const { data: result } = await api.put(`${BASE}/${id}`, toPayload(data))
  return result
}

export const deleteConduceDetalle = async (id) => {
  await api.delete(`${BASE}/${id}`)
}
