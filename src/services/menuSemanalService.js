import api from '../lib/api'
import { cleanParams, unwrapPaged } from './_helpers'
import { MENU_SEMANAL_ENDPOINTS } from '../models/menuSemanal'

const BASE = MENU_SEMANAL_ENDPOINTS.base

/** GET /api/menu-semanal?servicio=&semana=&diaSemana=&estado=&page=&pageSize= */
export const getMenuSemanal = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return unwrapPaged(data)
}

export const getMenuSemanalPaged = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return data
}

export const getMenuSemanalById = async (menuSemanalId) => {
  const { data } = await api.get(`${BASE}/${menuSemanalId}`)
  return data
}

const toDetalle = (d) => ({
  recetaId: Number(d.recetaId),
  porciones: Number(d.porciones) || 0,
  orden: d.orden === '' || d.orden === null || d.orden === undefined ? null : Number(d.orden),
  observaciones: d.observaciones || null,
})

const toPayload = (data) => ({
  servicio: data.servicio || null,
  semana: Number(data.semana) || 0,
  diaSemana: Number(data.diaSemana) || 1,
  fecha: data.fecha || null,
  estado: data.estado ?? true,
  detalles: (data.detalles ?? []).map(toDetalle),
})

/** POST /api/menu-semanal — EmpresaId lo toma el servidor del token. */
export const createMenuSemanal = async (data) => {
  const { data: result } = await api.post(BASE, toPayload(data))
  return result
}

/** PUT /api/menu-semanal/{id} — `detalles` reemplaza los existentes. */
export const updateMenuSemanal = async (menuSemanalId, data) => {
  const { data: result } = await api.put(`${BASE}/${menuSemanalId}`, toPayload(data))
  return result
}

export const deleteMenuSemanal = async (menuSemanalId) => {
  await api.delete(`${BASE}/${menuSemanalId}`)
}
