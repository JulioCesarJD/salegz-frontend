import api from '../lib/api'
import { cleanParams, unwrapPaged } from './_helpers'
import { CONDUCE_ENDPOINTS } from '../models/conduces'

/** GET /api/conduces?page=&pageSize= */
export const getConduces = async (params = {}) => {
  const { data } = await api.get(CONDUCE_ENDPOINTS.base, {
    params: cleanParams(params),
  })
  return unwrapPaged(data)
}

export const getConducesPaged = async (params = {}) => {
  const { data } = await api.get(CONDUCE_ENDPOINTS.base, {
    params: cleanParams(params),
  })
  return data
}

export const getConduceById = async (conduceId) => {
  const { data } = await api.get(`${CONDUCE_ENDPOINTS.base}/${conduceId}`)
  return data
}

/** POST /api/conduces/generar-jornada */
export const generarJornada = async ({ fecha, escuelasSinClase = [] }) => {
  const { data } = await api.post(CONDUCE_ENDPOINTS.generarJornada, {
    fecha,
    escuelasSinClase,
  })
  return data
}

export { CONDUCE_ENDPOINTS }
