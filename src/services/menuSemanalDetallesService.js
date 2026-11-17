import api from '../lib/api'
import { cleanParams, unwrapPaged } from './_helpers'
import { MENU_SEMANAL_DETALLE_ENDPOINTS } from '../models/menuSemanalDetalles'

const BASE = MENU_SEMANAL_DETALLE_ENDPOINTS.base

/** GET /api/menu-semanal-detalles?menuSemanalId=&recetaId=&page=&pageSize= */
export const getMenuSemanalDetalles = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return unwrapPaged(data)
}

export const getMenuSemanalDetallesPaged = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return data
}

export const getMenuSemanalDetalleById = async (id) => {
  const { data } = await api.get(`${BASE}/${id}`)
  return data
}

const toPayload = (data) => ({
  recetaId: Number(data.recetaId),
  porciones: Number(data.porciones) || 0,
  orden: data.orden === '' || data.orden === null || data.orden === undefined ? null : Number(data.orden),
  observaciones: data.observaciones || null,
})

/**
 * POST /api/menu-semanal/{menuSemanalId}/detalles
 * El id del padre va en la ruta, no en el body.
 */
export const createMenuSemanalDetalle = async (menuSemanalId, data) => {
  const { data: result } = await api.post(
    MENU_SEMANAL_DETALLE_ENDPOINTS.porMenu(menuSemanalId),
    toPayload(data)
  )
  return result
}

/** PUT /api/menu-semanal-detalles/{id} */
export const updateMenuSemanalDetalle = async (id, data) => {
  const { data: result } = await api.put(`${BASE}/${id}`, toPayload(data))
  return result
}

export const deleteMenuSemanalDetalle = async (id) => {
  await api.delete(`${BASE}/${id}`)
}
