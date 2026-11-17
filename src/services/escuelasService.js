import api from '../lib/api'
import { cleanParams, unwrapPaged } from './_helpers'
import { ESCUELA_ENDPOINTS } from '../models/escuelas'

const BASE = ESCUELA_ENDPOINTS.base

/** GET /api/escuelas?search=&estado=&page=&pageSize= */
export const getEscuelas = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return unwrapPaged(data)
}

export const getEscuelasPaged = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return data
}

export const getEscuelaById = async (escuelaId) => {
  const { data } = await api.get(`${BASE}/${escuelaId}`)
  return data
}

/** Construye el body con todos los campos del DTO. */
const toPayload = (data) => ({
  codigo: data.codigo || null,
  institucion: data.institucion || null,
  nombre: data.nombre ?? '',
  encargado: data.encargado || null,
  director: data.director || null,
  direccion: data.direccion || null,
  telefono: data.telefono || null,
  rnc: data.rnc || null,
  provincia: data.provincia || null,
  municipio: data.municipio || null,
  distrito: data.distrito || null,
  cantidadEstudiante: data.cantidadEstudiante ?? null,
  orden: data.orden ?? null,
  estado: data.estado ?? true,
})

/** POST /api/escuelas — EmpresaId lo toma el servidor del token. */
export const createEscuela = async (data) => {
  const { data: result } = await api.post(BASE, toPayload(data))
  return result
}

/** PUT /api/escuelas/{id} */
export const updateEscuela = async (escuelaId, data) => {
  const { data: result } = await api.put(`${BASE}/${escuelaId}`, toPayload(data))
  return result
}

export const deleteEscuela = async (escuelaId) => {
  await api.delete(`${BASE}/${escuelaId}`)
}
