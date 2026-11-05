/**
 * @typedef {Object} Permiso
 * @property {number} permisoId
 * @property {string} codigo Código "Modulo.Accion".
 * @property {string|null} modulo
 * @property {string|null} descripcion
 */

/**
 * `GET /api/permisos` devuelve el catálogo agrupado por módulo:
 * `{ [modulo: string]: Permiso[] }`.
 * @typedef {Record<string, Permiso[]>} CatalogoPermisos
 */

/**
 * @typedef {Object} AuditoriaPermiso
 * @property {number} auditoriaId
 * @property {number} usuarioActorId
 * @property {number} usuarioDestinoId
 * @property {string} permisoCodigo
 * @property {number} accion 0 = Otorgar, 1 = Revocar
 * @property {string} fecha
 */

export const PERMISO_ENDPOINTS = Object.freeze({
  catalogo: '/api/permisos',
  usuario: (usuarioId) => `/api/permisos/usuarios/${usuarioId}/permisos`,
  usuarioPermiso: (usuarioId, permisoId) =>
    `/api/permisos/usuarios/${usuarioId}/permisos/${permisoId}`,
  auditoria: '/api/permisos/auditoria',
})
