import api from '../lib/api'
import { cleanParams, unwrapPaged } from './_helpers'
import { EMPRESA_ENDPOINTS } from '../models/empresas'

/** GET /api/empresas?search=&estado=&page=&pageSize= */
export const getEmpresas = async (params = {}) => {
  const { data } = await api.get(EMPRESA_ENDPOINTS.base, {
    params: cleanParams(params),
  })
  return unwrapPaged(data)
}

export const getEmpresasPaged = async (params = {}) => {
  const { data } = await api.get(EMPRESA_ENDPOINTS.base, {
    params: cleanParams(params),
  })
  return data
}

export const getEmpresaById = async (empresaId) => {
  const { data } = await api.get(`${EMPRESA_ENDPOINTS.base}/${empresaId}`)
  return data
}

/** POST /api/empresas */
export const createEmpresa = async (data) => {
  const { data: created } = await api.post(EMPRESA_ENDPOINTS.base, data)
  return created
}

/** PUT /api/empresas/{id} — la API no permite eliminar empresas. */
export const updateEmpresa = async (empresaId, data) => {
  const { data: updated } = await api.put(
    `${EMPRESA_ENDPOINTS.base}/${empresaId}`,
    data
  )
  return updated
}

export { EMPRESA_ENDPOINTS }
