import api from '../lib/api'
import { cleanParams, unwrapPaged } from './_helpers'
import { CONDUCE_ENDPOINTS } from '../models/conduces'

const BASE = CONDUCE_ENDPOINTS.base

/** GET /api/conduces?search=&estado=&servicio=&page=&pageSize= */
export const getConduces = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return unwrapPaged(data)
}

export const getConducesPaged = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return data
}

export const getConduceById = async (conduceId) => {
  const { data } = await api.get(`${BASE}/${conduceId}`)
  return data
}

const toDetalle = (d) => ({
  recetaId: Number(d.recetaId),
  porciones: Number(d.porciones) || 0,
  precioUnitario: Number(d.precioUnitario) || 0,
  costoUnitario: Number(d.costoUnitario) || 0,
  observaciones: d.observaciones || null,
})

const toPayload = (data) => ({
  numeroConduce: data.numeroConduce ?? null,
  usuarioId: data.usuarioId ?? null,
  escuelaId: data.escuelaId ?? null,
  menuComidaId: data.menuComidaId ?? null,
  postreId: data.postreId ?? null,
  servicio: data.servicio || null,
  porciones: Number(data.porciones) || 0,
  fecha: data.fecha || null,
  observaciones: data.observaciones || null,
  edicionReceta: data.edicionReceta || null,
  edicionPostre: data.edicionPostre || null,
  estado: Number(data.estado ?? 0),
  detalles: (data.detalles ?? []).map(toDetalle),
})

/** POST /api/conduces — el servidor calcula Monto a partir de los detalles. */
export const createConduce = async (data) => {
  const { data: result } = await api.post(BASE, toPayload(data))
  return result
}

/** PUT /api/conduces/{id} — enviar `detalles` reemplaza los existentes. */
export const updateConduce = async (conduceId, data) => {
  const { data: result } = await api.put(`${BASE}/${conduceId}`, toPayload(data))
  return result
}

export const deleteConduce = async (conduceId) => {
  await api.delete(`${BASE}/${conduceId}`)
}

/** POST /api/conduces/generar-jornada */
export const generarJornada = async ({
  fecha,
  escuelasSinClase = [],
  menuComidaId = null,
  postreId = null,
  servicio = null,
  porciones = 0,
}) => {
  const { data } = await api.post(CONDUCE_ENDPOINTS.generarJornada, {
    fecha,
    escuelasSinClase,
    menuComidaId,
    postreId,
    servicio: servicio || null,
    porciones: Number(porciones) || 0,
  })
  return data
}

export { CONDUCE_ENDPOINTS }
