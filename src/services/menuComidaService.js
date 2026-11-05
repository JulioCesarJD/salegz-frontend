import api from '../lib/api'
import { unwrapPaged } from './_helpers'

const BASE = '/api/menu-comida'

/** GET /api/menu-comida — hoy devuelve una lista vacía. */
export const getMenuComida = async () => {
  const { data } = await api.get(BASE)
  return unwrapPaged(data)
}

/** POST /api/menu-comida — hoy responde `{ message: "ok" }`. */
export const createMenuComida = async (data) => {
  const { data: result } = await api.post(BASE, data)
  return result
}
