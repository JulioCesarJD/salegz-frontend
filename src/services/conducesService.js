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

/** POST /api/conduces */
export const createConduce = async (data) => {
  const { data: result } = await api.post(CONDUCE_ENDPOINTS.base, {
    numeroConduce: data.numeroConduce ?? null,
    escuelaId: data.escuelaId ?? null,
    menuComidaId: data.menuComidaId ?? null,
    postreId: data.postreId ?? null,
    fecha: data.fecha ?? null,
    observaciones: data.observaciones ?? null,
    edicionReceta: data.edicionReceta ?? null,
    edicionPostre: data.edicionPostre ?? null,
    estado: data.estado ?? 0,
  })
  return result
}

/** PUT /api/conduces/{id} */
export const updateConduce = async (conduceId, data) => {
  const { data: result } = await api.put(`${CONDUCE_ENDPOINTS.base}/${conduceId}`, {
    numeroConduce: data.numeroConduce ?? null,
    escuelaId: data.escuelaId ?? null,
    menuComidaId: data.menuComidaId ?? null,
    postreId: data.postreId ?? null,
    fecha: data.fecha ?? null,
    observaciones: data.observaciones ?? null,
    edicionReceta: data.edicionReceta ?? null,
    edicionPostre: data.edicionPostre ?? null,
    estado: data.estado ?? undefined,
  })
  return result
}

export const deleteConduce = async (conduceId) => {
  await api.delete(`${CONDUCE_ENDPOINTS.base}/${conduceId}`)
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
