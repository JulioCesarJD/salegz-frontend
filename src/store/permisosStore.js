// src/store/permisosStore.js
// Carga y cachea los permisos del usuario logueado
import { create } from 'zustand'
import api from '../lib/api'

const DEFAULT_PERMISOS = {
  verFacturas:       true,
  crearFacturas:     true,
  cancelarFacturas:  false,
  verCotizaciones:   true,
  crearCotizaciones: true,
  verCompras:        false,
  crearCompras:      false,
  verGastos:         false,
  crearGastos:       false,
  verCuadres:        true,
  crearCuadres:      true,
  verClientes:       true,
  crearClientes:     true,
  verProductos:      true,
  verReportes:       false,
}

export const usePermisosStore = create((set, get) => ({
  permisos:      DEFAULT_PERMISOS,
  loaded:        false,
  currentUserId: null,

  cargarPermisos: async (usuarioId, isAdmin) => {
    const state = get()

    // Si ya están cargados para este usuario, no cargar de nuevo
    if (state.currentUserId === usuarioId && state.loaded) {
      return
    }

    // Admin tiene todos los permisos
    if (isAdmin) {
      const todoPermitido = Object.fromEntries(
        Object.keys(DEFAULT_PERMISOS).map(k => [k, true])
      )
      set({ permisos: todoPermitido, loaded: true, currentUserId: usuarioId })
      return
    }

    try {
      const res = await api.get(`/api/usuarios/${usuarioId}/permisos`)
      set({ permisos: res.data, loaded: true, currentUserId: usuarioId })
    } catch (error) {
      console.error('Error cargando permisos:', error)
      set({ permisos: DEFAULT_PERMISOS, loaded: true, currentUserId: usuarioId })
    }
  },

  // Verificar si un permiso específico está activo
  tienePermiso: (permisoKey) => {
    return get().permisos[permisoKey] === true
  },

  reset: () => set({ permisos: DEFAULT_PERMISOS, loaded: false, currentUserId: null }),
}))
