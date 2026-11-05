import api from '../lib/api'
import { cleanParams, omitKey, unwrapPaged } from './_helpers'

const BASE = '/api/clientes'

/** GET /api/clientes?search=&page=&pageSize= */
export const getClientes = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return unwrapPaged(data)
}

export const getClientesPaged = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return data
}

export const getClienteById = async (clienteId) => {
  const { data } = await api.get(`${BASE}/${clienteId}`)
  return data
}

export const createCliente = async (data) => {
  const { data: created } = await api.post(BASE, data)
  return created
}

/** Acepta `{ clienteId, ...datos }` o `(id, datos)`. */
export const updateCliente = async (clienteOrId, maybeData) => {
  const clienteId =
    typeof clienteOrId === 'object' ? clienteOrId.clienteId : clienteOrId
  const body = omitKey(
    typeof clienteOrId === 'object' ? clienteOrId : maybeData,
    'clienteId'
  )

  const { data } = await api.put(`${BASE}/${clienteId}`, body)
  return data
}

export const deleteCliente = async (clienteId) => {
  await api.delete(`${BASE}/${clienteId}`)
}

/** No existe endpoint de toggle: se resuelve con un PUT sobre el estado actual. */
export const toggleEstadoCliente = async (clienteId) => {
  const actual = await getClienteById(clienteId)
  const nuevoEstado = actual?.estado === 1 ? 0 : 1
  return updateCliente(clienteId, { ...omitKey(actual, 'clienteId'), estado: nuevoEstado })
}
