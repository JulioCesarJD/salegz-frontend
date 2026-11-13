import api from '../lib/api'
import { cleanParams, unwrapPaged } from './_helpers'
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

/** POST /api/gastos — { descripcion, detalles: [{ usuarioId?, subTotal, itbis, comprobante? }] } */
export const createGasto = async (data) => {
  const { data: created } = await api.post(GASTO_ENDPOINTS.base, {
    descripcion: data.descripcion ?? '',
    detalles: (data.detalles ?? []).map((d) => ({
      usuarioId: d.usuarioId ?? null,
      subTotal: parseFloat(d.subTotal) || 0,
      itbis: parseFloat(d.itbis) || 0,
      comprobante: d.comprobante ?? null,
    })),
  })
  return created
}

/** PUT /api/gastos/{id} — reemplaza los detalles por los enviados. */
export const updateGasto = async (gastosId, data) => {
  const { data: updated } = await api.put(`${GASTO_ENDPOINTS.base}/${gastosId}`, {
    descripcion: data.descripcion ?? '',
    detalles: (data.detalles ?? []).map((d) => ({
      usuarioId: d.usuarioId ?? null,
      subTotal: parseFloat(d.subTotal) || 0,
      itbis: parseFloat(d.itbis) || 0,
      comprobante: d.comprobante ?? null,
    })),
  })
  return updated
}

export const deleteGasto = async (gastosId) => {
  await api.delete(`${GASTO_ENDPOINTS.base}/${gastosId}`)
}

export { GASTO_ENDPOINTS }
