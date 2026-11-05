import api from '../lib/api'
import { AUTH_ENDPOINTS } from '../models/auth'

export const login = async (correo, contrasena) => {
  const { data } = await api.post(AUTH_ENDPOINTS.login, { correo, contrasena })
  return data
}

export const refresh = async (refreshToken) => {
  const { data } = await api.post(AUTH_ENDPOINTS.refresh, { refreshToken })
  return data
}

export const logout = async (refreshToken) => {
  const { data } = await api.post(AUTH_ENDPOINTS.logout, { refreshToken })
  return data
}

/** Requiere el permiso Usuarios.Ver. */
export const me = async () => {
  const { data } = await api.get(AUTH_ENDPOINTS.me)
  return data
}

export const changePassword = async ({ contrasenaActual, nuevaContrasena }) => {
  const { data } = await api.post(AUTH_ENDPOINTS.changePassword, {
    contrasenaActual,
    nuevaContrasena,
  })
  return data
}

export const changePin = async ({ contrasenaActual, nuevoPin }) => {
  const { data } = await api.post(AUTH_ENDPOINTS.changePin, {
    contrasenaActual,
    nuevoPin,
  })
  return data
}
