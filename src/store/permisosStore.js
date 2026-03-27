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

export const usePermisosStore = create((set) => ({
  permisos:  DEFAULT_PERMISOS,
  loaded:    false,

  cargarPermisos: async (usuarioId, isAdmin) => {
    // Admin tiene todos los permisos
    if (isAdmin) {
      const todoPermitido = Object.fromEntries(
        Object.keys(DEFAULT_PERMISOS).map(k => [k, true])
      )
      set({ permisos: todoPermitido, loaded: true })
      return
    }
    try {
      const res = await api.get(`/api/usuarios/${usuarioId}/permisos`)
      set({ permisos: res.data, loaded: true })
    } catch {
      set({ permisos: DEFAULT_PERMISOS, loaded: true })
    }
  },

  reset: () => set({ permisos: DEFAULT_PERMISOS, loaded: false }),
}))
