import api from '../lib/api'
import { cleanParams, unwrapPaged } from './_helpers'
import { RECETA_INGREDIENTE_ENDPOINTS } from '../models/recetaIngredientes'

const BASE = RECETA_INGREDIENTE_ENDPOINTS.base

/** GET /api/receta-ingredientes?recetaId=&productoId=&page=&pageSize= */
export const getRecetaIngredientes = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return unwrapPaged(data)
}

export const getRecetaIngredientesPaged = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return data
}

export const getRecetaIngredienteById = async (id) => {
  const { data } = await api.get(`${BASE}/${id}`)
  return data
}

const toPayload = (data) => ({
  productoId: Number(data.productoId),
  cantidad: Number(data.cantidad) || 0,
  unidadMedida: data.unidadMedida || null,
})

/**
 * POST /api/recetas/{recetaId}/ingredientes
 * El id del padre va en la ruta, no en el body.
 */
export const createRecetaIngrediente = async (recetaId, data) => {
  const { data: result } = await api.post(
    RECETA_INGREDIENTE_ENDPOINTS.porReceta(recetaId),
    toPayload(data)
  )
  return result
}

/** PUT /api/receta-ingredientes/{id} */
export const updateRecetaIngrediente = async (id, data) => {
  const { data: result } = await api.put(`${BASE}/${id}`, toPayload(data))
  return result
}

export const deleteRecetaIngrediente = async (id) => {
  await api.delete(`${BASE}/${id}`)
}
