// UBICACIÓN: src/lib/tokenStorage.js

// Sesión exclusivamente en memoria.
// No se guardan tokens en localStorage ni sessionStorage.

let accessToken = null
let currentUser = null

// Limpia los restos de la versión anterior.
if (typeof window !== 'undefined') {
  localStorage.removeItem('sg_token')
  localStorage.removeItem('sg_refresh_token')
  localStorage.removeItem('sg_user')
}

export const getAccessToken = () => accessToken

export const getStoredUser = () => currentUser

export const saveUser = (user) => {
  currentUser = user || null
}

export function saveTokens({ accessToken: at }) {
  accessToken = at || null
}

/**
 * Guarda la sesión recibida desde /api/auth/login.
 *
 * @param {{ accessToken: string, expiracion?: string, usuario?: object }} session
 */
export function saveSession(session) {
  if (!session) return

  saveTokens(session)

  if (session.usuario) {
    saveUser(session.usuario)
  }
}

export function clearSession() {
  accessToken = null
  currentUser = null
}

// Eventos de sincronización interna.

export const SESSION_EXPIRED_EVENT = 'sg:session-expired'

// La API rechazó una acción por permisos.
export const PERMISSIONS_CHANGED_EVENT = 'sg:permissions-changed'