import axios from 'axios'
import toast from 'react-hot-toast'
import { API_URL, API_TIMEOUT_MS } from '../config/env'
import { normalizeApiError } from './apiErrors'
import {
  getAccessToken,
  getRefreshToken,
  saveSession,
  clearSession,
  SESSION_UPDATED_EVENT,
  SESSION_EXPIRED_EVENT,
} from './tokenStorage'

const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request: token de acceso ───────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Refresh de sesión ──────────────────────────────────────────────────────
const AUTH_URLS = ['/api/auth/login', '/api/auth/refresh', '/api/auth/logout']
const isAuthUrl = (url = '') => AUTH_URLS.some((path) => url.includes(path))

let refreshPromise = null
let expiredNotified = false

async function refreshSession() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('No hay refresh token disponible')

  // axios "puro" para no volver a entrar al interceptor.
  const { data } = await axios.post(
    `${API_URL}/api/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' }, timeout: API_TIMEOUT_MS }
  )

  saveSession(data)
  window.dispatchEvent(new CustomEvent(SESSION_UPDATED_EVENT, { detail: data }))
  return data.accessToken
}

function expireSession() {
  clearSession()
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
  if (!expiredNotified) {
    expiredNotified = true
    toast.error('Tu sesión expiró. Inicia sesión nuevamente.', { id: 'session-expired' })
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener(SESSION_UPDATED_EVENT, () => {
    expiredNotified = false
  })
}

// ── Response: refresh automático y errores globales ────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {}
    const status = error.response?.status
    const url = original.url || ''

    // 401 → intentar refresh una sola vez y reintentar la petición original.
    if (status === 401 && !original._retry && !isAuthUrl(url)) {
      original._retry = true
      try {
        if (!refreshPromise) {
          refreshPromise = refreshSession().finally(() => {
            refreshPromise = null
          })
        }
        const accessToken = await refreshPromise
        original.headers = original.headers || {}
        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      } catch {
        expireSession()
        return Promise.reject(normalizeApiError(error))
      }
    }

    const normalized = normalizeApiError(error)

    // Login/refresh/logout ya muestran su propio mensaje en pantalla.
    if (isAuthUrl(url)) return Promise.reject(normalized)

    // Manejo global mínimo; cada pantalla puede mostrar su propio mensaje.
    if (status === 403) {
      toast.error(normalized.userMessage || 'No tienes permisos para realizar esta acción.', {
        id: 'api-403',
      })
    } else if (status >= 500) {
      toast.error('Error del servidor. Intenta nuevamente en unos segundos.', {
        id: 'api-500',
      })
    }

    // 404 se deja a la pantalla para que muestre su estado vacío/no encontrado.
    return Promise.reject(normalized)
  }
)

export default api
