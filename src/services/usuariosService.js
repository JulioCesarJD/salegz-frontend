import api from '../lib/api'
import { cleanParams, notSupported, omitKey, unwrapPaged } from './_helpers'
import { USUARIO_ENDPOINTS } from '../models/usuarios'

/** GET /api/usuarios?search=&empresaId=&tipoUsuario=&activo=&page=&pageSize= */
export const getUsuarios = async (params = {}) => {
  const { data } = await api.get(USUARIO_ENDPOINTS.base, {
    params: cleanParams(params),
  })
  return unwrapPaged(data)
}

export const getUsuariosPaged = async (params = {}) => {
  const { data } = await api.get(USUARIO_ENDPOINTS.base, {
    params: cleanParams(params),
  })
  return data
}

export const getUsuarioById = async (usuarioId) => {
  const { data } = await api.get(`${USUARIO_ENDPOINTS.base}/${usuarioId}`)
  return data
}

/** POST /api/usuarios */
// export const createUsuario = async (data) => {
//   const { data: created } = await api.post(USUARIO_ENDPOINTS.base, data)
//   return created
// }

export const createUsuario = async (usuario) => {
  const payload = {
    nombre: usuario.nombre?.trim(),
    correo: usuario.correo?.trim(),
    contrasena: usuario.contrasena,
    tipoUsuario: Number(usuario.tipoUsuario),
    empresaId: usuario.empresaId == null ? null : Number(usuario.empresaId),
    pin: usuario.pin == null ? null : Number(usuario.pin),
    activo: usuario.activo ?? true,
  }

  const { data: created } = await api.post(USUARIO_ENDPOINTS.base, payload)
  return created
}

/** PUT /api/usuarios/{id} */
export const updateUsuario = async (usuarioOrId, maybeData) => {
  const usuarioId =
    typeof usuarioOrId === 'object' ? usuarioOrId.usuarioId : usuarioOrId
  const body = omitKey(
    typeof usuarioOrId === 'object' ? usuarioOrId : maybeData,
    'usuarioId'
  )

  const { data } = await api.put(`${USUARIO_ENDPOINTS.base}/${usuarioId}`, body)
  return data
}

export const deleteUsuario = async (usuarioId) => {
  await api.delete(`${USUARIO_ENDPOINTS.base}/${usuarioId}`)
}

/**
 * La API solo permite que el propio usuario cambie su contraseña
 * mediante POST /api/auth/change-password.
 */
export const cambiarContrasenaUsuario = () =>
  notSupported('Cambiar la contraseña de otro usuario')

export { USUARIO_ENDPOINTS }
