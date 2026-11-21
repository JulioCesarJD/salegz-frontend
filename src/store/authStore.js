// UBICACIÓN: src/store/authStore.js
import { create } from 'zustand'
import api from '../lib/api'
import { getErrorMessage } from '../lib/apiErrors'
import {
  getStoredUser,
  saveSession,
  clearSession,
  SESSION_EXPIRED_EVENT,
  PERMISSIONS_CHANGED_EVENT,
} from '../lib/tokenStorage'
import { usePermisosStore } from './permisosStore'

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  ready: false,

  // No se restaura sesión con refresh token.
  // Al iniciar o recargar la aplicación, debe iniciar sesión.
  restoreSession: () => {
    clearSession()
    usePermisosStore.getState().reset()

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      ready: true,
    })
  },

  login: async (correo, contrasena) => {
    set({ loading: true })

    try {
      const { data } = await api.post('/api/auth/login', {
        correo,
        contrasena,
      })

      saveSession(data)
      usePermisosStore.getState().cargarPermisos(data.usuario)

      set({
        user: data.usuario,
        token: data.accessToken,
        isAuthenticated: true,
        loading: false,
        ready: true,
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
    try {
      await api.post('/api/auth/logout')
    } catch {
      // El cierre local funciona aunque el servidor no responda.
    }

    clearSession()
    usePermisosStore.getState().reset()

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      ready: true,
    })
  },

  setSession: (session) => {
    if (!session) return

    saveSession(session)

    if (session.usuario) {
      usePermisosStore.getState().cargarPermisos(session.usuario)
    }

    set({
      user: session.usuario || null,
      token: session.accessToken || null,
      isAuthenticated: !!session.accessToken,
      ready: true,
    })
  },

  clearSession: () => {
    clearSession()
    usePermisosStore.getState().reset()

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      ready: true,
    })
  },
}))

// Sincroniza el estado cuando la API expira la sesión.
if (typeof window !== 'undefined') {
  window.addEventListener(SESSION_EXPIRED_EVENT, () => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      ready: true,
    })

    usePermisosStore.getState().reset()
  })

  // Recarga los permisos cuando la API detecta un cambio.
  window.addEventListener(PERMISSIONS_CHANGED_EVENT, () => {
    const user = getStoredUser()

    if (!user) return

    usePermisosStore.getState().cargarPermisos(user)
    useAuthStore.setState({ user })
  })
}