import api from '../lib/api'
import { cleanParams, unwrapPaged } from './_helpers'
import { MENU_COMIDA_DETALLE_ENDPOINTS } from '../models/menuComidaDetalles'

const BASE = MENU_COMIDA_DETALLE_ENDPOINTS.base

/** GET /api/menu-comida-detalles?menuComidaId=&productoId=&search=&page=&pageSize= */
export const getMenuComidaDetalles = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return unwrapPaged(data)
}

export const getMenuComidaDetallesPaged = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return data
}

export const getMenuComidaDetalleById = async (id) => {
  const { data } = await api.get(`${BASE}/${id}`)
  return data
}

const toPayload = (data) => ({
  productoId: Number(data.productoId),
  cantidad: Number(data.cantidad) || 0,
  unidadMedida: data.unidadMedida || null,
  costoUnitario: Number(data.costoUnitario) || 0,
  observacion: data.observacion || null,
})

/**
 * POST /api/menu-comida/{menuComidaId}/detalles
 * El id del padre va en la ruta, no en el body.
 */
export const createMenuComidaDetalle = async (menuComidaId, data) => {
  const { data: result } = await api.post(
    MENU_COMIDA_DETALLE_ENDPOINTS.porMenu(menuComidaId),
    toPayload(data)
  )
  return result
}

/** PUT /api/menu-comida-detalles/{id} */
export const updateMenuComidaDetalle = async (id, data) => {
  const { data: result } = await api.put(`${BASE}/${id}`, toPayload(data))
  return result
}

export const deleteMenuComidaDetalle = async (id) => {
  await api.delete(`${BASE}/${id}`)
}
