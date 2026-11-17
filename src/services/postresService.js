import api from '../lib/api'
import { cleanParams, unwrapPaged } from './_helpers'
import { POSTRE_ENDPOINTS } from '../models/postres'

const BASE = POSTRE_ENDPOINTS.base

/** GET /api/postres?search=&estado=&page=&pageSize= */
export const getPostres = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return unwrapPaged(data)
}

export const getPostresPaged = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return data
}

export const getPostreById = async (postreId) => {
  const { data } = await api.get(`${BASE}/${postreId}`)
  return data
}

const toPayload = (data) => ({
  nombre: data.nombre ?? '',
  costo: Number(data.costo) || 0,
  estado: data.estado ?? true,
})

/** POST /api/postres */
export const createPostre = async (data) => {
  const { data: result } = await api.post(BASE, toPayload(data))
  return result
}

/** PUT /api/postres/{id} */
export const updatePostre = async (postreId, data) => {
  const { data: result } = await api.put(`${BASE}/${postreId}`, toPayload(data))
  return result
}

export const deletePostre = async (postreId) => {
  await api.delete(`${BASE}/${postreId}`)
}
