import api from '../lib/api'
import { unwrapPaged } from './_helpers'

const BASE = '/api/postres'

/** GET /api/postres — hoy devuelve una lista vacía. */
export const getPostres = async () => {
  const { data } = await api.get(BASE)
  return unwrapPaged(data)
}

/** POST /api/postres — hoy responde `{ message: "ok" }`. */
export const createPostre = async (data) => {
  const { data: result } = await api.post(BASE, data)
  return result
}
