// Único punto de acceso a la sesión persistida.
// Evita importar el store de auth desde el cliente HTTP (dependencia circular).
const ACCESS_TOKEN_KEY = 'sg_token'
const REFRESH_TOKEN_KEY = 'sg_refresh_token'
const USER_KEY = 'sg_user'

const safeParse = (value) => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getStoredUser() {
  return safeParse(localStorage.getItem(USER_KEY))
}

export function saveUser(user) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
}

export function saveTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

/**
 * Guarda la respuesta completa de /auth/login o /auth/refresh.
 * @param {{ accessToken: string, refreshToken: string, usuario: object }} session
 */
export function saveSession(session) {
  if (!session) return
  saveTokens(session)
  if (session.usuario) saveUser(session.usuario)
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const SESSION_UPDATED_EVENT = 'sg:session-updated'
export const SESSION_EXPIRED_EVENT = 'sg:session-expired'
