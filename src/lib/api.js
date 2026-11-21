// UBICACIÓN: src/lib/api.js
import axios from 'axios'
import toast from 'react-hot-toast'
import { API_URL, API_TIMEOUT_MS } from '../config/env'
import { normalizeApiError } from './apiErrors'
import {
  getAccessToken,
  clearSession,
  SESSION_EXPIRED_EVENT,
  PERMISSIONS_CHANGED_EVENT,
} from './tokenStorage'

const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT_MS,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

const AUTH_URLS = [
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/auth/logout',
]

const isAuthUrl = (url = '') =>
  AUTH_URLS.some((path) => url.includes(path))

let expiredNotified = false

// Limpia la sesión cuando el Access Token expira.
function expireSession() {
  clearSession()

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
  }

  if (!expiredNotified) {
    expiredNotified = true

    toast.error('Tu sesión expiró. Inicia sesión nuevamente.', {
      id: 'session-expired',
    })
  }
}

// ── Request: enviar Access Token ───────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token && !isAuthUrl(config.url)) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// ── Response: errores y expiración ────────────────────────────────────

api.interceptors.response.use(
  (response) => {
    // Reinicia el aviso cuando un login es exitoso.
    if (response.config?.url?.includes('/api/auth/login')) {
      expiredNotified = false
    }

    return response
  },

  (error) => {
    const original = error.config || {}
    const status = error.response?.status
    const url = original.url || ''

    const normalized = normalizeApiError(error)

    // Los errores de login/logout/refresh se manejan localmente.
    if (isAuthUrl(url)) {
      return Promise.reject(normalized)
    }

    // 401: Access Token inválido o expirado.
    // No se intenta renovar el token.
    if (status === 401) {
      expireSession()

      return Promise.reject(normalized)
    }

    // 403: usuario sin permiso para realizar la acción.
    if (status === 403) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new Event(PERMISSIONS_CHANGED_EVENT)
        )
      }

      toast.error(
        normalized.userMessage ||
          'No posees el permiso requerido para esta acción.',
        { id: 'api-403' }
      )
    } else if (status >= 500) {
      toast.error(
        'Error del servidor. Intenta nuevamente en unos segundos.',
        { id: 'api-500' }
      )
    }

    return Promise.reject(normalized)
  }
)

export default api