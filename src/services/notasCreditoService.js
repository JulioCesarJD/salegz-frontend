import api from '../lib/api'
import { notSupported, unwrapPaged } from './_helpers'

const BASE = '/api/notas-credito'

/** GET /api/notas-credito — hoy devuelve una lista vacía. */
export const getNotasCredito = async () => {
  const { data } = await api.get(BASE)
  return unwrapPaged(data)
}

/**
 * La API no expone GET /api/notas-credito/{id}.
 * Se resuelve sobre el listado para no inventar un endpoint.
 */
export const getNotaCreditoById = async (notaCreditoId) => {
  const items = await getNotasCredito()
  return items.find((n) => n.notaCreditoId === Number(notaCreditoId)) ?? null
}

/** POST /api/notas-credito — hoy responde `{ message: "ok" }`. */
export const createNotaCredito = async (data) => {
  const { data: result } = await api.post(BASE, data)
  return result
}

/** La API no expone cancelación de notas de crédito. */
export const cancelarNotaCredito = () =>
  notSupported('Cancelar una nota de crédito')

export { BASE as NOTA_CREDITO_ENDPOINTS_BASE }
