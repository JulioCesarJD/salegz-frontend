import api from '../lib/api'
import { cleanParams, omitKey, unwrapPaged } from './_helpers'

const BASE = '/api/productos'

/** GET /api/productos?search=&categoriaId=&page=&pageSize= */
export const getProductos = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return unwrapPaged(data)
}

export const getProductosPaged = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return data
}

export const getProductoById = async (productoId) => {
  const { data } = await api.get(`${BASE}/${productoId}`)
  return data
}

export const createProducto = async (data) => {
  const { data: created } = await api.post(BASE, data)
  return created
}

/** Acepta `{ productoId, ...datos }` o `(id, datos)`. */
export const updateProducto = async (productoOrId, maybeData) => {
  const productoId =
    typeof productoOrId === 'object' ? productoOrId.productoId : productoOrId
  const body = omitKey(
    typeof productoOrId === 'object' ? productoOrId : maybeData,
    'productoId'
  )

  const { data } = await api.put(`${BASE}/${productoId}`, body)
  return data
}

export const deleteProducto = async (productoId) => {
  await api.delete(`${BASE}/${productoId}`)
}

/** POST /api/productos/{id}/ajustar-inventario */
export const ajustarInventario = async (productoId, { cantidad, motivo }) => {
  const { data } = await api.post(`${BASE}/${productoId}/ajustar-inventario`, {
    cantidad,
    motivo,
  })
  return data
}
