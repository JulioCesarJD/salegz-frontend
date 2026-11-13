import api from '../lib/api'
import { cleanParams, unwrapPaged } from './_helpers'

const BASE = '/api/escuelas'

/** GET /api/escuelas?search=&page=&pageSize= */
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

/** POST /api/escuelas — EmpresaId lo toma el servidor del token. */
export const createEscuela = async (data) => {
  const { data: result } = await api.post(BASE, {
    nombre: data.nombre,
    encargado: data.encargado ?? null,
    direccion: data.direccion ?? null,
    telefono: data.telefono ?? null,
    provincia: data.provincia ?? null,
    municipio: data.municipio ?? null,
    distrito: data.distrito ?? null,
    cantidadEstudiante: data.cantidadEstudiante ?? null,
    orden: data.orden ?? null,
  })
  return result
}

/** PUT /api/escuelas/{id} */
export const updateEscuela = async (escuelaId, data) => {
  const { data: result } = await api.put(`${BASE}/${escuelaId}`, {
    nombre: data.nombre ?? '',
    encargado: data.encargado ?? null,
    direccion: data.direccion ?? null,
    telefono: data.telefono ?? null,
    provincia: data.provincia ?? null,
    municipio: data.municipio ?? null,
    distrito: data.distrito ?? null,
    cantidadEstudiante: data.cantidadEstudiante ?? null,
    orden: data.orden ?? null,
  })
  return result
}

export const deleteEscuela = async (escuelaId) => {
  await api.delete(`${BASE}/${escuelaId}`)
}
