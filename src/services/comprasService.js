import api from '../lib/api'
import { cleanParams, notSupported, unwrapPaged } from './_helpers'
import { COMPRA_ENDPOINTS } from '../models/compras'

/** GET /api/compras?search=&estado=&page=&pageSize= */
export const getCompras = async (params = {}) => {
  const { data } = await api.get(COMPRA_ENDPOINTS.base, {
    params: cleanParams(params),
  })
  return unwrapPaged(data)
}

export const getComprasPaged = async (params = {}) => {
  const { data } = await api.get(COMPRA_ENDPOINTS.base, {
    params: cleanParams(params),
  })
  return data
}

export const getCompraById = async (compraId) => {
  const { data } = await api.get(`${COMPRA_ENDPOINTS.base}/${compraId}`)
  return data
}

/** POST /api/compras */
export const createCompra = async (data) => {
  const { data: created } = await api.post(COMPRA_ENDPOINTS.base, data)
  return created
}

/** POST /api/compras/{id}/cancelar */
export const cancelarCompra = async (compraId) => {
  const { data } = await api.post(COMPRA_ENDPOINTS.cancelar(compraId))
  return data
}

/** La API solo permite cancelar; no existe endpoint para saldar/pagar. */
export const saldarCompra = () =>
  notSupported('Registrar el pago de una compra')

/** La API no expone PUT /api/compras/{id}. */
export const updateCompra = () => notSupported('Editar una compra')

export { COMPRA_ENDPOINTS }
