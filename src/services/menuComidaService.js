import api from '../lib/api'
import { cleanParams, unwrapPaged } from './_helpers'

const BASE = '/api/menu-comida'

/** GET /api/menu-comida?search=&page=&pageSize= */
export const getMenuComida = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return unwrapPaged(data)
}

export const getMenuComidaPaged = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return data
}

export const getMenuComidaById = async (menuComidaId) => {
  const { data } = await api.get(`${BASE}/${menuComidaId}`)
  return data
}

/** POST /api/menu-comida — EmpresaId lo toma el servidor del token. */
export const createMenuComida = async (data) => {
  const { data: result } = await api.post(BASE, {
    nombre: data.nombre ?? '',
    precio: data.precio ?? 0,
    costo: data.costo ?? 0,
  })
  return result
}

/** PUT /api/menu-comida/{id} */
export const updateMenuComida = async (menuComidaId, data) => {
  const { data: result } = await api.put(`${BASE}/${menuComidaId}`, {
    nombre: data.nombre ?? '',
    precio: data.precio ?? 0,
    costo: data.costo ?? 0,
  })
  return result
}

export const deleteMenuComida = async (menuComidaId) => {
  await api.delete(`${BASE}/${menuComidaId}`)
}
