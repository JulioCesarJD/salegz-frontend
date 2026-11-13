import api from '../lib/api'
import { EMPRESA_ENDPOINTS } from '../models/empresas'

/** GET /api/controles/{empresaId} */
export const getControles = async (empresaId) => {
  const { data } = await api.get(EMPRESA_ENDPOINTS.controles(empresaId))
  return data
}

/**
 * PUT /api/controles/{empresaId}
 * Responde el ControlesDto actualizado (la API ya no es stub).
 */
export const updateControles = async (empresaId, data) => {
  const { data: result } = await api.put(
    EMPRESA_ENDPOINTS.controles(empresaId),
    data
  )
  return result
}
