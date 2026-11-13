import api from '../lib/api'
import { cleanParams, unwrapPaged } from './_helpers'
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

/**
 * POST /api/compras/{id}/pagar-credito — registra un abono.
 * Compra no tiene MontoPagado: el servidor calcula el saldo como
 * Total − Σ abonos y marca Saldado al cubrir el total.
 */
export const saldarCompra = async (compraId, data) => {
  const { data: result } = await api.post(COMPRA_ENDPOINTS.pagarCredito(compraId), {
    monto: parseFloat(data.monto) || 0,
    metodoPago: data.metodoPago ?? null,
    descripcionPago: data.descripcionPago ?? null,
  })
  return result
}

/** La API no expone PUT /api/compras/{id}. */
export const updateCompra = () =>
  Promise.reject(new Error('Editar una compra no está disponible en la API actual.'))

export { COMPRA_ENDPOINTS }
