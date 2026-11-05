import { create } from 'zustand'
import api from '../lib/api'

const stored = () => {
  try { return JSON.parse(localStorage.getItem('sg_user') || 'null') }
  catch { return null }
}

export const useAuthStore = create((set) => ({
  user:            stored(),
  token:           localStorage.getItem('sg_token') || null,
  isAuthenticated: !!localStorage.getItem('sg_token'),
  loading:         false,

  login: async (correo, contrasena) => {
    set({ loading: true })
    try {
      const { data } = await api.post('/api/auth/login', { correo, contrasena })
      const user = { usuarioId: data.usuarioId, nombre: data.nombre, tipoUsuario: data.tipoUsuario }
      localStorage.setItem('sg_token', data.token)
      localStorage.setItem('sg_user',  JSON.stringify(user))
      set({ token: data.token, user, isAuthenticated: true, loading: false, modulos: data.modulos })
      return { ok: true, user }
    } catch (e) {
      set({ loading: false })
      return { ok: false, error: e.response?.data?.message || 'Credenciales incorrectas' }
    }
  },

  logout: () => {
    localStorage.removeItem('sg_token')
    localStorage.removeItem('sg_user')
    set({ user: null, token: null, isAuthenticated: false })
    // Resetear permisos al hacer logout
    const { usePermisosStore } = require('./permisosStore')
    usePermisosStore.getState().reset()
  },
}))
