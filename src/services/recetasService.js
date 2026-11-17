import api from '../lib/api'
import { cleanParams, unwrapPaged } from './_helpers'
import { RECETA_ENDPOINTS } from '../models/recetas'

const BASE = RECETA_ENDPOINTS.base

/** GET /api/recetas?search=&estado=&page=&pageSize= */
export const getRecetas = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return unwrapPaged(data)
}

export const getRecetasPaged = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return data
}

export const getRecetaById = async (recetaId) => {
  const { data } = await api.get(`${BASE}/${recetaId}`)
  return data
}

const toIngrediente = (i) => ({
  productoId: Number(i.productoId),
  cantidad: Number(i.cantidad) || 0,
  unidadMedida: i.unidadMedida || null,
})

const toPayload = (data) => ({
  codigo: data.codigo || null,
  nombre: data.nombre ?? '',
  descripcion: data.descripcion || null,
  porcionesBase: Number(data.porcionesBase) || 0,
  precioVenta: Number(data.precioVenta) || 0,
  costo: Number(data.costo) || 0,
  estado: data.estado ?? true,
  ingredientes: (data.ingredientes ?? []).map(toIngrediente),
})

/** POST /api/recetas — EmpresaId lo toma el servidor del token. */
export const createReceta = async (data) => {
  const { data: result } = await api.post(BASE, toPayload(data))
  return result
}

/** PUT /api/recetas/{id} — `ingredientes` reemplaza los existentes. */
export const updateReceta = async (recetaId, data) => {
  const { data: result } = await api.put(`${BASE}/${recetaId}`, toPayload(data))
  return result
}

export const deleteReceta = async (recetaId) => {
  await api.delete(`${BASE}/${recetaId}`)
}
