import api from '../lib/api'
import { cleanParams, unwrapPaged } from './_helpers'

const BASE = '/api/categorias'

/** GET /api/categorias?search=&page=&pageSize= */
export const getCategorias = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return unwrapPaged(data)
}

/** Igual que getCategorias, pero conserva totalCount/totalPages. */
export const getCategoriasPaged = async (params = {}) => {
  const { data } = await api.get(BASE, { params: cleanParams(params) })
  return data
}

export const getCategoriaById = async (categoriaId) => {
  const { data } = await api.get(`${BASE}/${categoriaId}`)
  return data
}

export const createCategoria = async (data) => {
  const { data: created } = await api.post(BASE, {
    descripcion: data.descripcion,
    estado: data.estado ?? 1,
  })
  return created
}

/** Acepta `{ categoriaId, ...datos }` o `(id, datos)`. */
export const updateCategoria = async (categoriaOrId, maybeData) => {
  const categoriaId =
    typeof categoriaOrId === 'object' ? categoriaOrId.categoriaId : categoriaOrId
  const body =
    typeof categoriaOrId === 'object'
      ? { descripcion: categoriaOrId.descripcion, estado: categoriaOrId.estado }
      : { descripcion: maybeData?.descripcion, estado: maybeData?.estado }

  const { data } = await api.put(`${BASE}/${categoriaId}`, body)
  return data
}

export const deleteCategoria = async (categoriaId) => {
  await api.delete(`${BASE}/${categoriaId}`)
}

/** No existe endpoint de toggle: se resuelve con un PUT sobre el estado actual. */
export const toggleEstadoCategoria = async (categoriaId) => {
  const actual = await getCategoriaById(categoriaId)
  const nuevoEstado = actual?.estado === 1 ? 0 : 1
  return updateCategoria(categoriaId, {
    descripcion: actual?.descripcion ?? '',
    estado: nuevoEstado,
  })
}
