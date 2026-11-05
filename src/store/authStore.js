import { create } from 'zustand'
import api from '../lib/api'
import { getErrorMessage } from '../lib/apiErrors'
import {
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  saveSession,
  clearSession,
  SESSION_UPDATED_EVENT,
  SESSION_EXPIRED_EVENT,
} from '../lib/tokenStorage'
import { usePermisosStore } from './permisosStore'

export const useAuthStore = create((set) => ({
  user: getStoredUser(),
  token: getAccessToken(),
  isAuthenticated: !!getAccessToken(),
  loading: false,

  login: async (correo, contrasena) => {
    set({ loading: true })
    try {
      const { data } = await api.post('/api/auth/login', { correo, contrasena })

      // La API devuelve { accessToken, refreshToken, expiracion, usuario }.
      saveSession(data)
      usePermisosStore.getState().cargarPermisos(data.usuario)

      set({
        user: data.usuario,
        token: data.accessToken,
        isAuthenticated: true,
        loading: false,
      })

      return { ok: true, user: data.usuario }
    } catch (error) {
      set({ loading: false })
      return {
        ok: false,
        error: getErrorMessage(error, 'Credenciales incorrectas.'),
      }
    }
  },

  logout: async () => {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        await api.post('/api/auth/logout', { refreshToken })
      } catch {
        // El logout local debe funcionar aunque el servidor no responda.
      }
    }

    clearSession()
    usePermisosStore.getState().reset()
    set({ user: null, token: null, isAuthenticated: false, loading: false })
  },

  setSession: (session) => {
    if (!session) return
    saveSession(session)
    usePermisosStore.getState().cargarPermisos(session.usuario)
    set({
      user: session.usuario || null,
      token: session.accessToken || null,
      isAuthenticated: true,
    })
  },

  clearSession: () => {
    clearSession()
    usePermisosStore.getState().reset()
    set({ user: null, token: null, isAuthenticated: false, loading: false })
  },
}))

// Sincroniza el store cuando el cliente HTTP renueva o invalida la sesión.
if (typeof window !== 'undefined') {
  window.addEventListener(SESSION_UPDATED_EVENT, (event) => {
    const session = event.detail
    if (!session?.usuario) return

    useAuthStore.setState({
      user: session.usuario,
      token: session.accessToken,
      isAuthenticated: true,
    })
    usePermisosStore.getState().cargarPermisos(session.usuario)
  })

  window.addEventListener(SESSION_EXPIRED_EVENT, () => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
    })
    usePermisosStore.getState().reset()
  })
}
