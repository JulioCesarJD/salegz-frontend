import api from '../lib/api'
import { cleanParams, unwrapPaged } from './_helpers'
import { MENU_COMIDA_ENDPOINTS } from '../models/menuComida'

const BASE = MENU_COMIDA_ENDPOINTS.base

/** GET /api/menu-comida?search=&estado=&page=&pageSize= */
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

const toDetalle = (d) => ({
  productoId: d.productoId,
  cantidad: Number(d.cantidad) || 0,
  unidadMedida: d.unidadMedida || null,
  costoUnitario: Number(d.costoUnitario) || 0,
  observacion: d.observacion || null,
})

/** POST /api/menu-comida — EmpresaId lo toma el servidor del token. */
export const createMenuComida = async (data) => {
  const { data: result } = await api.post(BASE, {
    nombre: data.nombre ?? '',
    precio: Number(data.precio) || 0,
    costo: Number(data.costo) || 0,
    estado: data.estado ?? true,
    detalles: (data.detalles ?? []).map(toDetalle),
  })
  return result
}

/** PUT /api/menu-comida/{id} — `detalles` reemplaza los existentes. */
export const updateMenuComida = async (menuComidaId, data) => {
  const { data: result } = await api.put(`${BASE}/${menuComidaId}`, {
    nombre: data.nombre ?? '',
    precio: Number(data.precio) || 0,
    costo: Number(data.costo) || 0,
    estado: data.estado ?? true,
    detalles: (data.detalles ?? []).map(toDetalle),
  })
  return result
}

export const deleteMenuComida = async (menuComidaId) => {
  await api.delete(`${BASE}/${menuComidaId}`)
}
