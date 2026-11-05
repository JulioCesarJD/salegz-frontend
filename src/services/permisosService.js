import api from '../lib/api'
import { cleanParams } from './_helpers'
import { PERMISO_ENDPOINTS } from '../models/permisos'

/** GET /api/permisos — catálogo agrupado por módulo. */
export const getCatalogo = async () => {
  const { data } = await api.get(PERMISO_ENDPOINTS.catalogo)
  return data ?? {}
}

/** Convierte el catálogo agrupado en una lista plana. */
export const getCatalogoPlano = async () => {
  const agrupado = await getCatalogo()
  return Object.values(agrupado).flat()
}

/** GET /api/permisos/usuarios/{usuarioId}/permisos */
export const getUsuarioPermisos = async (usuarioId) => {
  const { data } = await api.get(PERMISO_ENDPOINTS.usuario(usuarioId))
  return data ?? []
}

/** PUT /api/permisos/usuarios/{usuarioId}/permisos */
export const reemplazarPermisos = async (usuarioId, permisoIds) => {
  const { data } = await api.put(PERMISO_ENDPOINTS.usuario(usuarioId), {
    permisoIds,
  })
  return data
}

/** POST /api/permisos/usuarios/{usuarioId}/permisos/{permisoId} */
export const otorgarPermiso = async (usuarioId, permisoId) => {
  const { data } = await api.post(
    PERMISO_ENDPOINTS.usuarioPermiso(usuarioId, permisoId)
  )
  return data
}

/** DELETE /api/permisos/usuarios/{usuarioId}/permisos/{permisoId} */
export const revocarPermiso = async (usuarioId, permisoId) => {
  const { data } = await api.delete(
    PERMISO_ENDPOINTS.usuarioPermiso(usuarioId, permisoId)
  )
  return data
}

/** GET /api/permisos/auditoria?usuarioId=&accion=&fechaDesde=&fechaHasta=&page=&pageSize= */
export const getAuditoria = async (params = {}) => {
  const { data } = await api.get(PERMISO_ENDPOINTS.auditoria, {
    params: cleanParams(params),
  })
  return data ?? []
}

export { PERMISO_ENDPOINTS }
