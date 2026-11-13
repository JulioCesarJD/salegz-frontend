import api from '../lib/api'
import { cleanParams, unwrapPaged } from './_helpers'

const BASE = '/api/notas-credito'

/** GET /api/notas-credito?search=&facturaId=&fechaDesde=&fechaHasta=&page=&pageSize= */
export const getNotasCredito = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return unwrapPaged(data)
}

export const getNotasCreditoPaged = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return data
}

/** GET /api/notas-credito/{id} — endpoint real de la API. */
export const getNotaCreditoById = async (notaCreditoId) => {
  const { data } = await api.get(`${BASE}/${notaCreditoId}`)
  return data
}

/**
 * POST /api/notas-credito
 * Payload real: { facturaId, razonModificacion, detalles: [{ productoId, cantidad }] }
 * El servidor calcula Total/ITBIS, genera comprobante fiscal y reduce la
 * factura original en la misma transacción.
 */
export const createNotaCredito = async (data) => {
  const { data: result } = await api.post(BASE, {
    facturaId: data.facturaId,
    razonModificacion: data.razonModificacion ?? '',
    detalles: (data.detalles ?? []).map((d) => ({
      productoId: d.productoId,
      cantidad: parseFloat(d.cantidad) || 0,
    })),
  })
  return result
}

export { BASE as NOTA_CREDITO_ENDPOINTS_BASE }
