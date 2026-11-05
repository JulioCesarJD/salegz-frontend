// src/store/permisosStore.js
// Carga y cachea los permisos del usuario logueado
import { create } from 'zustand'
import api from '../lib/api'
import { isSuperAdmin } from '../utils/auth'

const DEFAULT_PERMISOS = {
  // Módulo Facturación
  verFacturas:       true,
  crearFacturas:     false,
  cancelarFacturas:  false,
  verCotizaciones:   true,
  crearCotizaciones: false,
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
  verDashboard:      true,
  verInventario:     true,
  verCategorias:     true,
  verCuentaPorCobrar: true,
  verCuentasPagar:   false,
  verOrdenes:        true,
  verNotasCredito:   true,
  verNcf:            false,
  verFiscal:         false,
  verDesclose:       true,
  crearProductos:    false,
  crearInventario:   false,
  editarInventario:  false,
  eliminarInventario: false,

  // Módulos nuevos
  verUsuarios:       false,
  crearUsuarios:     false,
  editarUsuarios:    false,
  eliminarUsuarios:  false,
  verSeguridad:      false,
  asignarPermisos:   false,
  cambiarTipoUsuario:false,
}

export const usePermisosStore = create((set, get) => ({
  permisos:      DEFAULT_PERMISOS,
  loaded:        false,
  currentUserId: null,
  isLoadingPermissions: false,

  cargarPermisos: async (usuarioId, user) => {
    const state = get()

    // Si ya están cargados para este usuario, no cargar de nuevo
    if (state.currentUserId === usuarioId && state.loaded) {
      return
    }

    // Prevenir llamadas simultáneas
    if (state.isLoadingPermissions) {
      return
    }

    set({ isLoadingPermissions: true })

    // SuperAdmin tiene todos los permisos y módulos — nunca pide nada al backend
    if (isSuperAdmin(user)) {
      const todoPermitido = Object.fromEntries(
        Object.keys(DEFAULT_PERMISOS).map(k => [k, true])
      )
      set({ permisos: todoPermitido, loaded: true, currentUserId: usuarioId, isLoadingPermissions: false })
      return
    }

    try {
      const res = await api.get(`/api/usuarios/${usuarioId}/permisos`)
      // El backend devuelve los permisos explícitos; los fusionamos dando prioridad
      // a los datos del servidor sobre los defaults.
      const mergedPermisos = { ...res.data, ...DEFAULT_PERMISOS }
      set({ permisos: mergedPermisos, loaded: true, currentUserId: usuarioId, isLoadingPermissions: false })
    } catch (error) {
      console.error('Error cargando permisos:', error)
      // Si es 401 y aún no tenemos datos, no hacer logout automático
      // para evitar el bucle "login-inmediate-loout"
      if (error.response?.status === 401 && !state.loaded) {
        set({ permisos: DEFAULT_PERMISOS, loaded: true, currentUserId: usuarioId, isLoadingPermissions: false })
        throw new Error('session_expired')
      }
      // Fallback: solo defaults
      set({ permisos: DEFAULT_PERMISOS, loaded: true, currentUserId: usuarioId, isLoadingPermissions: false })
    }
  },

  // Verificar si un permiso específico está activo
  tienePermiso: (permisoKey) => {
    return get().permisos[permisoKey] === true
  },

  reset: () => set({ permisos: DEFAULT_PERMISOS, loaded: false, currentUserId: null, isLoadingPermissions: false }),
}))