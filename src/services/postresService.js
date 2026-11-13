import api from '../lib/api'
import { cleanParams, unwrapPaged } from './_helpers'

const BASE = '/api/postres'

// Nota: Postre no tiene EmpresaId en la API. El alcance por empresa se
// resuelve en el servidor vía Conduce -> Escuela; el frontend solo consume
// el listado resultante.

/** GET /api/postres?search=&page=&pageSize= */
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

/** POST /api/postres */
export const createPostre = async (data) => {
  const { data: result } = await api.post(BASE, { nombre: data.nombre ?? '' })
  return result
}

/** PUT /api/postres/{id} */
export const updatePostre = async (postreId, data) => {
  const { data: result } = await api.put(`${BASE}/${postreId}`, { nombre: data.nombre ?? '' })
  return result
}

export const deletePostre = async (postreId) => {
  await api.delete(`${BASE}/${postreId}`)
}
