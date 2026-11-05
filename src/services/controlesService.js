import api from '../lib/api'
import { EMPRESA_ENDPOINTS } from '../models/empresas'

/** GET /api/controles/{empresaId} */
export const getControles = async (empresaId) => {
  const { data } = await api.get(EMPRESA_ENDPOINTS.controles(empresaId))
  return data
}

/**
 * PUT /api/controles/{empresaId}
 * El controlador actualmente es un stub que responde `{ message: "ok" }`.
 */
export const updateControles = async (empresaId, data) => {
  const { data: result } = await api.put(
    EMPRESA_ENDPOINTS.controles(empresaId),
    data
  )
  return result
}
