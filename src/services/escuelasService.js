import api from '../lib/api'
import { unwrapPaged } from './_helpers'

const BASE = '/api/escuelas'

/** GET /api/escuelas — hoy devuelve una lista vacía. */
export const getEscuelas = async () => {
  const { data } = await api.get(BASE)
  return unwrapPaged(data)
}

/** POST /api/escuelas — hoy responde `{ message: "ok" }`. */
export const createEscuela = async (data) => {
  const { data: result } = await api.post(BASE, data)
  return result
}
