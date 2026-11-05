import api from '../lib/api'
import { cleanParams, notSupported, unwrapPaged } from './_helpers'
import { GASTO_ENDPOINTS } from '../models/gastos'

/** GET /api/gastos?search=&fechaDesde=&fechaHasta=&page=&pageSize= */
export const getGastos = async (params = {}) => {
  const { data } = await api.get(GASTO_ENDPOINTS.base, {
    params: cleanParams(params),
  })
  return unwrapPaged(data)
}

export const getGastosPaged = async (params = {}) => {
  const { data } = await api.get(GASTO_ENDPOINTS.base, {
    params: cleanParams(params),
  })
  return data
}

export const getGastoById = async (gastosId) => {
  const { data } = await api.get(`${GASTO_ENDPOINTS.base}/${gastosId}`)
  return data
}

/** POST /api/gastos */
export const createGasto = async (data) => {
  const { data: created } = await api.post(GASTO_ENDPOINTS.base, data)
  return created
}

export const deleteGasto = async (gastosId) => {
  await api.delete(`${GASTO_ENDPOINTS.base}/${gastosId}`)
}

/** La API no expone actualización de gastos. */
export const updateGasto = () => notSupported('Editar un gasto')

/**
 * Los "conceptos de gasto" no existen en la API actual.
 * Se conservan como stubs explícitos para no llamar endpoints inexistentes.
 */
export const getConsumos = () => notSupported('El catálogo de conceptos de gasto')
export const createConsumo = () => notSupported('Crear conceptos de gasto')
export const updateConsumo = () => notSupported('Editar conceptos de gasto')
export const searchConsumos = () => Promise.resolve([])

export { GASTO_ENDPOINTS }
